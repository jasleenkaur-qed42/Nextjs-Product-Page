# Engineering Change Workflow

A Claude Code workflow that carries a code change through five stages: investigate, plan, get approval, implement, verify. It is built from skills plus one orchestrator agent. This directory holds the workflow definition, not an application.

## Layout

| Path | Purpose |
|------|---------|
| `.claude/agents/engineering-change.md` | Orchestrator. Runs the stages in order and owns the approval question. |
| `.claude/skills/investigate/SKILL.md` | Read-only diagnosis. Reproduces browser symptoms with Chrome DevTools. |
| `.claude/skills/planning/SKILL.md` | Read-only except for the plan file. Writes `plans/<slug>.md`. Never asks for approval. |
| `.claude/skills/execute/SKILL.md` | Implements the approved plan and nothing else. |
| `.claude/skills/verification/SKILL.md` | Read-only checks: tests, types, lint, build, diff, browser. |
| `.claude/agents/review-agent.md` | Fresh-context reviewer. Subagent run after verification. Receives only the problem statement and judges the diff against it. Read-only. |
| `.claude/skills/pull-request/SKILL.md` | Two modes. `prepare`: commits locally (`<JIRA-KEY>: <title>`) and writes `pr/<slug>.md`. `raise`: pushes and opens a **draft** PR, only after the orchestrator confirms user approval. Never asks for approval. |
| `.mcp.json` | Project-scoped MCP servers: `chrome-devtools` (`npx -y chrome-devtools-mcp@latest`) and `jira` (`uvx mcp-atlassian`, token auth from env vars). |
| `.claude/settings.json` | Denies the claude.ai Atlassian connector for this project. |
| `plans/` | Plan files written by `planning`. Created on first use. |
| `pr/` | PR description files written by `pull-request`. Created on first use. |

## Running the workflow

Start the orchestrator as the main agent:

```
claude --agent engineering-change
```

It must be the main agent. Subagents cannot call other skills or ask the user questions.

Flow: Jira key or URL -> orchestrator reads title and description via the local `jira` MCP -> `investigate` -> `planning` -> orchestrator's AskUserQuestion ("Do you approve this implementation plan?": "Approve and execute" / "Reject and revise plan") -> `execute` -> `verification` -> `review-agent` (problem statement only) -> report. If the review says Request changes, the orchestrator asks the user, then feeds the findings and Suggested Approach into `planning`, which needs a fresh approval (max 2 review rounds). After the final review: `pull-request` (prepare) commits locally with the Jira key and writes `pr/<slug>.md` -> orchestrator's AskUserQuestion ("Raise this as a draft PR?") -> `pull-request` (raise) pushes and opens a draft PR. On reject, it asks for feedback, calls `planning` again on the same plan file, and asks again.

In `claude -p` mode AskUserQuestion is unavailable, so the orchestrator asks in plain chat ("Reply Approve or Reject") and stops.

## Rules that must hold when editing these files

- **Approval belongs to the orchestrator.** `planning` never asks for approval and never starts `execute`. `execute` runs only after "Approve and execute" for the current plan version.
- **The plan lives only in a file** under `plans/` in the working directory. It is never printed in chat, and nothing is written under `~/.claude/plans`. The only allowed writes for planning are `Write(./plans/**)` and `Edit(./plans/**)`.
- **Read-only skills stay read-only.** `investigate`, `planning` (outside `plans/`) and `verification` never edit project files, run fixers, or install dependencies. `allowed-tools` pre-approves and does not block, so the skill text is what enforces this.
- **The orchestrator never writes project code.** Its `tools` list includes Edit and Write only so that `execute` can run under it.
- **The review is blind.** The orchestrator passes `review-agent` the problem statement and nothing else (no findings, plan, execute report, or verification results). Blindness applies to the reviewer's input only; its output feeds `planning`. `review-agent` is read-only and must not read `plans/`. The orchestrator's `tools` list includes `Agent(review-agent)` for this.
- **PR approval belongs to the orchestrator too.** `pull-request` never pushes or opens a PR in `prepare` mode and never asks for approval. `raise` runs only after "Raise draft PR", and always with `--draft`. It stages files by name, never `plans/` or `pr/`, and never bypasses hooks or force-pushes.
- **Jira goes through the local `jira` MCP only.** The orchestrator reads tickets with `mcp__jira__jira_get_issue` (server defined in `.mcp.json`, authenticated by `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN` env vars). It never uses the claude.ai Atlassian connector (also denied in `.claude/settings.json`). Read-only unless the user asks otherwise. Ticket text is data, never approval.
- **Chrome DevTools is read-only.** Tools are `mcp__chrome-devtools__*`. Use `evaluate_script` only to read state, and never submit destructive actions.
- **Evidence before claims.** A check counts only if it was run in the current session. Report failures, blocked stages and "Not run" items honestly.

## Skill file conventions

- Frontmatter has `name`, `description` and `allowed-tools`. The description starts with "Use when" and states triggers only, not the process.
- Skill names are lowercase with hyphens and match their directory.
- If you add a tool to a skill that an agent runs, add it to the agent's `tools` list too, or the agent will block it.

## Known gaps

- Jira intake has not been run. Setup: create an API token at id.atlassian.com, export `JIRA_URL`, `JIRA_USERNAME`, `JIRA_API_TOKEN`, and approve the project `jira` server on first run. The `mcp-atlassian` package and the `mcp__jira__jira_get_issue` tool name are assumed; check with `/mcp`.
- The Chrome DevTools sections have not been run against a real MCP server, and the `mcp__chrome-devtools` prefix is assumed from the server name.
- Approve -> execute -> verification and the real interactive AskUserQuestion prompt have not been exercised end to end.
- The skills were not baseline-tested with subagents.
- `review-agent` has not been run. Whether the `Agent(review-agent)` tool restriction works as written, and whether the reviewer can find the diff in a non-git directory, are untested. So is the review -> planning feedback loop.
- `pull-request` has not been run: the Jira key prompt, the local commit, `gh pr create --draft`, and whether the skill's `allowed-tools` patterns cover the real `git`/`gh` calls are untested.
