---
name: planning
description: Use when investigation findings exist (typically an investigate report) and the next question is what exactly should be changed - which files, what edits, which tests - before any implementation begins.
allowed-tools: Write(./plans/**), Edit(./plans/**), Read, Grep, Glob, Bash(git log:*), Bash(git blame:*), Bash(git diff:*), Bash(git show:*), Bash(git status:*), Bash(git branch:*), Bash(ls:*), Bash(cat:*), Bash(head:*), Bash(tail:*), Bash(wc:*), Bash(find:*), Bash(grep:*), Bash(rg:*)
---

# Planning (Read-Only Implementation Plan)

## Overview

Answers: **given what we discovered, what exactly should we change?** Turn investigation findings into a concrete, reviewable implementation plan, then stop. This skill never changes the project.

**Core principle:** Investigation is already done. Treat the `investigate` report as the source of truth and decide what to change; never redo the diagnosis.

## Input

Consume the `## Investigation` report produced by `investigate` (Problem, Relevant Code, Flow, Evidence, Root Cause, Confidence, Related Tests, Constraints / Risks).

- If no report is in the conversation, stop and ask for it (or suggest running `investigate`). Do not investigate it yourself and do not plan from a guess.
- If Confidence is Low or the root cause is an unverified hypothesis, say so at the top and make "get the missing evidence via `investigate`" the plan. Do not gather that evidence here.

## Scope Boundary

| Belongs to `investigate` (do NOT redo) | Belongs to `planning` |
|---|---|
| Finding the problem area, tracing flow, reproducing | Deciding which files change |
| Git history, dependency/config discovery | Deciding what changes and why |
| Determining root cause | Reuse choices, test plan, compat, risks, verification |

Reading is limited to what is needed to write precise changes: open the files the report names, and run targeted lookups only for planning questions (existing helper to reuse, tests to update, callers affected by a signature change, verification commands). If you find the report is wrong or incomplete, say so and send it back; don't re-derive the root cause.

## Read-Only Rules

**Only write target:** the plan file under `plans/` in the current working directory (see Plan File). Nothing else may be written.

**Never:** edit, create, or delete any file in the project; write the "plan" as a patch applied to disk; run mutating commands (formatters, `--fix`, installs, migrations, `git checkout/reset/commit/stash`).

**Allowed:** Read, Grep, Glob, read-only git, and scratchpad notes. Short illustrative snippets inside the plan text are fine; applying them is not.

## Process

1. **Read the findings.** Restate the root cause in one line, taken from the report as-is.
2. **Identify files to change.** Start from the report's Relevant Code; add only callers, types, exports, config, and docs affected by the change. Prefer the fewest files that address the root cause.
3. **Define each change.** For every file: what changes, and **why** it is necessary (tie it to the root cause). Change the origin of the problem, not the symptom's location.
4. **Look for reuse.** Search for existing helpers, hooks, components, utilities, and patterns that already do this. Reuse or extend them; propose a new abstraction only when none fits, and say why.
5. **Plan tests.** Find existing tests on the path (update if their expectations encode the bug). Specify new regression tests: name, scenario, and the assertion that fails before the change and passes after. Only if the project already has a test setup: name the existing test(s) that cover the change and add a regression test with the existing framework. If the project has no tests, write "None, project has no test setup" under Tests and never plan to add or install a test framework or its dependencies (Vitest, Jest, Testing Library and the like). For a UI change, put the Chrome DevTools check (URL, steps, expected result) under Verification.
6. **Assess compatibility.** Public APIs, props/signatures, exported types, persisted data, config or env, behavior consumers may rely on, supported versions.
7. **List risks.** Blast radius, behavior changes for unaffected paths, untested areas, ordering/performance concerns, and assumptions from the investigation still unverified.
8. **Define verification.** Exact commands (discover them from package.json/Makefile/CI config, don't invent), narrowest first, then broader; plus any manual check that confirms the original symptom is gone.
9. **Order the steps** so each leaves the code in a working state, and keep scope to the root cause. Put unrelated cleanups under Risks as "out of scope", not in Changes.

## Red Flags - Stop and Re-check

| Thought | Reality |
|---------|---------|
| "I'll just make the edit to be sure" | Not allowed. Plan only. |
| "While we're here, let's refactor X" | Out of scope. List it as out of scope. |
| "I'll add a new helper" | Did you search for an existing one? |
| "The tests will probably still pass" | Name which tests encode current behavior and check. |
| "Let me trace the flow / reproduce it first" | That's `investigate`'s job. Use its report. |
| "I doubt the root cause, I'll re-derive it" | Flag the doubt and send it back; don't redo the investigation. |
| "The user seems fine with it, I'll start" | Planning never starts `execute`. Hand off and stop. |
| "Verification: run the tests" | Give the actual command, targeted first. |

## Output Format

Write the plan into the plan file (see Plan File) in exactly this structure; do not print it in chat. Write "None" rather than omitting a section. Add a one-line note under Files if backward compatibility or reuse needs calling out.

```
## Implementation Plan

### Files

`path/to/file`
- What changes and why (tie to root cause).

`path/to/file.test`
- Test added or updated.

### Changes

1. Concrete change, the reason it is necessary, and any existing abstraction reused (name it with path).
2. ...
3. ...

### Tests

- Existing test: which, and whether it needs updating.
- New regression test: scenario and what it asserts (fails before, passes after).

### Risks

- Backward-compatibility concerns (APIs, types, data, config).
- Behavioral risks and unverified assumptions.
- Out of scope items noticed.

### Verification

1. Targeted test command.
2. Type/lint check command.
3. Full test suite command.
4. Manual check that the original symptom is resolved (if applicable).
```

## Plan File

Once the plan is drafted, save it as a file in the `plans/` directory of the current working directory: `plans/<short-kebab-slug>.md` (create the file with Write, which creates the directory if needed). The file contains exactly the `## Implementation Plan` from Output Format, nothing else.

**The plan lives only in this file. Never paste or summarize it in chat**, not at creation, after edits, or after approval. In chat, send only a short notice: the plan is written, the full path, and a one-line description of what it covers (e.g. "3 files, 2 tests"). The user reads the file.

- This is the single source of truth, and the user may edit it.
- Write only inside `plans/`; don't touch any other project file. If the write is denied, stop and say so. Never fall back to another location or printing the plan in chat.
- On a revision, update the same file rather than creating another.

## Hand-Off

Planning ends when the plan file is saved. **This skill never asks for approval and never starts `execute`**; the caller (the `engineering-change` orchestrator, or the user) decides what happens next.

Return to the caller, in chat and briefly:
- the plan file path,
- a one-line scope (e.g. "3 files, 2 tests, 1 risk"),
- the plan's `files`, `tests`, and `risks` as short lists of names only (no detail).

On a revision request (feedback from the caller), update the same plan file and hand off again. Revising means editing the plan, not re-investigating; if the feedback needs new evidence, say so and send it back to `investigate`. Planning stays read-only with respect to the project, including during revisions. Never implement the plan yourself.

## Common Mistakes

- Printing the plan in chat instead of only writing it to the file.
- Asking for approval or starting implementation; that belongs to the caller.
- Re-investigating (tracing, reproducing, git archaeology) instead of using the report.
- Planning around a hypothesis as though it were the confirmed root cause.
- Fixing where the error surfaces instead of where it originates.
- Proposing new abstractions without searching for existing ones.
- Vague changes ("update logic") with no what/why.
- Omitting a regression test that fails before the change when the project already has a test setup.
- Planning to install or add a test framework or other dev dependency.
