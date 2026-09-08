#!/bin/bash
# PreToolUse guard: blocks Claude from viewing .env file contents, directly
# (Read/Grep) or indirectly via shell commands (cat, less, grep, python, etc).
# .env.example / .env.sample / .env.template are exempt (placeholders, not secrets).
set -euo pipefail

input=$(cat)
tool_name=$(jq -r '.tool_name // empty' <<< "$input")

is_env_path() {
  local base
  base=$(basename -- "$1")
  [[ "$base" =~ ^\.env(\..+)?$ ]] || return 1
  [[ "$base" =~ ^\.env\.(example|sample|template)$ ]] && return 1
  return 0
}

# True if $1 contains a reference to a non-exempt .env* file.
has_env_reference() {
  local tokens non_exempt
  tokens=$(grep -Eo '(^|[^A-Za-z0-9_./-])\.env(\.[A-Za-z0-9_.-]+)?' <<< "$1" | sed -E 's/^.*(\.env)/\1/' || true)
  [ -z "$tokens" ] && return 1
  non_exempt=$(grep -Eiv '^\.env\.(example|sample|template)$' <<< "$tokens" || true)
  [ -n "$non_exempt" ]
}

deny() {
  jq -n --arg reason "$1" \
    '{hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "deny", permissionDecisionReason: $reason}}'
  exit 0
}

case "$tool_name" in
  Read|NotebookEdit)
    file_path=$(jq -r '.tool_input.file_path // empty' <<< "$input")
    if [ -n "$file_path" ] && is_env_path "$file_path"; then
      deny "Reading .env files is blocked by policy. Use .env.example for reference values."
    fi
    ;;
  Grep)
    path=$(jq -r '.tool_input.path // empty' <<< "$input")
    glob=$(jq -r '.tool_input.glob // empty' <<< "$input")
    if { [ -n "$path" ] && is_env_path "$path"; } || { [ -n "$glob" ] && has_env_reference "$glob"; }; then
      deny "Searching .env file contents is blocked by policy."
    fi
    ;;
  Bash)
    cmd=$(jq -r '.tool_input.command // empty' <<< "$input")
    if [ -n "$cmd" ] && has_env_reference "$cmd"; then
      deny "This command references a .env file. Viewing or executing .env content via shell commands is blocked by policy."
    fi
    ;;
esac

exit 0
