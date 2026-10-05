---
name: investigate
description: Use when asked to investigate, diagnose, or explain what is happening and why in a codebase - a bug, unexpected behavior, failing test, regression, or "how does this work" question - and the goal is understanding and root cause, not a fix.
allowed-tools: mcp__chrome-devtools, Read, Grep, Glob, Bash(git log:*), Bash(git blame:*), Bash(git diff:*), Bash(git show:*), Bash(git status:*), Bash(git branch:*), Bash(ls:*), Bash(cat:*), Bash(head:*), Bash(tail:*), Bash(wc:*), Bash(find:*), Bash(grep:*), Bash(rg:*)
---

# Engineering Workflow (Read-Only Investigation)

## Overview

Find out **what is happening and why**. Produce evidence and a root cause, then stop. This skill never changes the project.

**Core principle:** Evidence first, hypotheses labeled as hypotheses, root cause only after tracing the flow. The first suspicious line is a lead, not a conclusion.

## Read-Only Rules

**Never:**
- Edit, create, or delete source, test, config, or lockfile content in the project
- "Fix" anything while investigating, even a one-character typo
- Refactor or rewrite code because it looks cleaner
- Run commands that mutate state (`git checkout/reset/commit/stash`, formatters, `--fix`, migrations, installs, codegen that writes into the repo)

**Allowed:** Read, Grep, Glob, `git log/blame/diff/show/status`, running existing tests and the app, small throwaway repro scripts written to the scratchpad directory (never the repo).

If a command might write into the repo (snapshots, build output, caches), don't run it, or run it against a copy in the scratchpad. If a fix seems obvious, describe it under Root Cause or Constraints; do not apply it.

## Process

1. **Understand the request.** Restate the symptom, expected vs. actual behavior, and where it was observed. If ambiguous in a way that changes what you'd investigate, ask one focused question; otherwise state your assumption.
2. **Locate the area.** Grep for error messages, route/component/function names, and identifiers from the report. Identify entry points.
3. **Find related code.** Files, functions, components, hooks, APIs, handlers, models, and callers (both directions: who calls it, what it calls).
4. **Trace the flow.** Follow execution/data from trigger to symptom, reading each hop. Note where data changes shape, is cached, filtered, or swallowed.
5. **Inspect tests.** Find tests covering the path. Note what they assert, what they mock, and what they fail to cover. Run them if that gives evidence.
6. **Check git history when useful.** `git log -p -S<symbol>`, `git blame`, recent changes to the files in the flow. Useful for regressions and unexplained design.
7. **Identify dependencies and config.** Env vars, feature flags, build/config files, library versions, external services, permissions.
8. **Reproduce when possible.** Run the failing test or minimal scenario and capture actual output. If the problem is observable in a browser (UI bug, console error, failed request, layout, slow page), reproduce it with Chrome DevTools; see Browser Reproduction. If you can't reproduce, say so and why.
9. **Separate fact from hypothesis.** Every claim in Evidence must be something you observed (file:line, command output, log, commit). Everything else is labeled a hypothesis.
10. **Determine root cause.** Test the leading hypothesis against the evidence and against at least one alternative. Ask "why" until you reach the origin, not the symptom's location. Check that the cause explains *all* observed behavior, including what works.

## Browser Reproduction (Chrome DevTools)

For any symptom that shows up in a web page, reproduce it in a real browser through the Chrome DevTools MCP tools (`mcp__chrome-devtools__*`) instead of reasoning from code alone.

1. Confirm the tools are available and the app URL is known (dev server already running, or started with an existing project script). If the tools are missing, say so, mark the reproduction "not run: Chrome DevTools unavailable", and lower Confidence. Don't fall back to guessing.
2. Open the page and follow the user's steps (navigate, click, fill) to the point of failure.
3. Capture evidence at the failure: console messages (errors/warnings with stack traces), failed or wrong network requests (URL, status, payload), a page snapshot or screenshot, and DOM or computed-style state when layout is involved. Use performance traces only for slowness symptoms.
4. Record in Evidence: the steps, the URL, and what each capture showed. Map stack traces and request URLs back to source files for Relevant Code and Flow.
5. Read-only means the app's state, not just the repo: don't submit destructive actions (delete, pay, send) against real data, and don't run scripts that change page data. Use `evaluate_script` only to read state.

Not a browser symptom (CLI, backend, library)? Skip this section.

## Red Flags - Stop and Re-check

| Thought | Reality |
|---------|---------|
| "This line looks wrong, that's it" | Confirm it is actually reached and that it produces the symptom. |
| "I'll just fix it quickly to verify" | Not allowed. Reason from evidence or a scratchpad repro. |
| "This code is ugly, let me clean it" | Out of scope. Ugly is not the cause. |
| "Tests pass, so the code is fine" | Check what the tests actually cover and mock. |
| "It's a UI bug, I'll read the component and guess" | Reproduce it in Chrome DevTools and capture console/network first. |
| "I can't reproduce, so it's not real" | Report as unreproduced; lower confidence. |
| "Probably X" (no evidence) | Put it under hypothesis, or go get evidence. |

## Output Format

Always respond in exactly this structure. Use file paths with line numbers. Write "None found" or "N/A" rather than omitting a section.

```
## Investigation

### Problem
What is reported/observed vs. expected.

### Relevant Code
- `src/...` - role in the flow
- `src/...`

### Flow
1. Trigger / entry point
2. ...
3. Where behavior diverges

### Evidence
- Observed facts only (file:line, command output, git commit, test result)
- Hypotheses, explicitly prefixed "Hypothesis:", with what would confirm or refute them

### Root Cause
The origin of the problem and why it produces the symptom. Mention ruled-out alternatives.

### Confidence
High / Medium / Low - and the reason (reproduced? explains all symptoms? untested assumptions?)

### Related Tests
Existing tests covering this path, what they miss, and any that fail.

### Constraints / Risks
Config, dependencies, compatibility, blast radius of the area, and considerations for whoever fixes it. Describe, don't implement.
```

## Common Mistakes

- Reporting where the error is *thrown* instead of where the bad state *originates*.
- Listing hypotheses under Evidence.
- High confidence without reproduction or a ruled-out alternative.
- Leaving scratch files or edits in the repo.
