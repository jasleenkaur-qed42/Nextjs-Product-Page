---
name: pull-request
description: Use when a change has been implemented, verified and reviewed and needs to be committed and prepared as a draft pull request - the commit message, the PR description file, and (only after the orchestrator confirms user approval) the push and draft PR.
allowed-tools: Read, Grep, Glob, Write(./pr/**), Edit(./pr/**), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Bash(git remote:*), Bash(git checkout -b:*), Bash(git switch -c:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(gh pr create:*), Bash(gh pr view:*), Bash(gh auth status:*), Bash(gh repo view:*), Bash(ls:*), Bash(cat:*)
---

# Pull Request (Commit, Describe, Raise as Draft)

## Overview

Turns a finished change into a commit and a draft PR. It runs in two modes, chosen by the orchestrator:

- **prepare**: commit locally and write the PR description to `pr/<slug>.md`. Nothing leaves the machine.
- **raise**: push the branch and open the draft PR from that file. Run only after the user approved this PR file in this run.

**Core principle:** Nothing is published without the user having read the PR file and approved it. This skill never asks for approval; the orchestrator does.

## Input

- The Jira ticket key (for example `PROJ-123`), taken from the user's request. If none was given, stop and report "Jira ticket key missing"; do not invent one.
- The plan path, the verification result, and the review verdict with any remaining limitations (the PR description needs them, and the commit is the first place where the review's findings may be shown).
- The mode: `prepare` or `raise`.

## Prepare

1. **Check the repo.** `git status`, `git branch --show-current`. If not a git repo, stop and report that a commit and PR cannot be made.
2. **Branch.** If on `main`, `master`, or the default branch, create `<ticket-key-lowercase>-<slug>` with `git checkout -b`. Otherwise stay on the current branch.
3. **Stage only the change.** Add the files the diff shows as the change by name. Never `git add -A` or `git add .`. Never stage `plans/`, `pr/`, `.env*`, secrets, build output, or files unrelated to the change; list anything skipped.
4. **Commit.** One commit:
   - Subject: `<TICKET-KEY>: <imperative title, max ~70 chars>` (for example `PROJ-123: Clamp quantity to avoid NaN total`).
   - Body: a short why (cause and fix), wrapped at ~72 chars.
   - End with the attribution line the session's system reminder gives, if one is present.
   - Never use `--no-verify`, `--amend`, or force. If a hook fails, report it and stop; do not bypass it.
5. **Write `pr/<slug>.md`** (create `pr/` if missing) in the format below. It is the only file this skill creates.
6. **Return** the commit hash, the branch, the PR file path, and the PR title. Do not paste the PR body into chat.

## Raise

1. Re-read `pr/<slug>.md` (the user may have edited it). Use its title and body as they are now.
2. `git push -u origin <branch>`. Never force-push.
3. `gh pr create --draft --title "<title>" --body-file pr/<slug>.md`. **Always `--draft`.** Never mark it ready for review.
4. Return the PR URL. If push or `gh` fails (no remote, not authenticated), report the exact error; do not try another way to publish.

## PR File Format

```
# <TICKET-KEY>: <title>

## Summary
<what changed and why, 2-3 sentences>

## Jira
<TICKET-KEY> (link if the user gave one)

## Root Cause
<the underlying cause, not the symptom>

## Changes
- `path/file.ts` - <what changed>

## Testing
- <command> - <result as reported by verification>
- Browser: <result or Not run, with reason>

## Review
<verdict, and what the reviewer raised and how it was handled; remaining limitations>

## Risks / Notes
<risks, follow-ups, anything the reviewer of the PR should know>
```

Only report what was verified in this run. Do not write "tests pass" unless the verification result says so; put Not run items under Testing.

## Red Flags - Stop and Re-check

| Thought | Reality |
|---------|---------|
| "I'll push now, the user will approve anyway" | No. Raise only after approval of this PR file. |
| "Mark it ready, it is reviewed" | Always draft. |
| "`git add -A` is quicker" | Stage by name. Plans and PR files are not part of the change. |
| "The hook failed, use `--no-verify`" | Report it and stop. |
| "No ticket number, I'll make one up" | Stop and report it missing. |
| "I'll put the description in chat" | It lives in `pr/<slug>.md`. |
