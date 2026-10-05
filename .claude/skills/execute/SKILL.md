---
name: execute
description: Use when an implementation plan (typically a planning report) has been approved and the next step is to make those changes in the repo, constrained to what the plan says.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash(git log:*), Bash(git diff:*), Bash(git show:*), Bash(git status:*), Bash(git branch:*), Bash(ls:*), Bash(cat:*), Bash(head:*), Bash(tail:*), Bash(wc:*), Bash(find:*), Bash(grep:*), Bash(rg:*), Bash(npm test:*), Bash(npm run:*), Bash(pnpm test:*), Bash(pnpm run:*), Bash(yarn test:*), Bash(yarn run:*)
---

# Execute (Plan-Constrained Implementation)

## Overview

Implements an **approved** `## Implementation Plan`, then reports what changed. This is the only skill in the workflow that modifies the repo.

**Core principle:** The plan is the contract. Change exactly the files and behavior it lists. Anything else needs new approval.

## Input

- Requires an `## Implementation Plan` (from `planning`) that the user explicitly approved (the `engineering-change` orchestrator's AskUserQuestion, answer "Approve and execute") for the **current version** of the plan, with the plan file path passed in by the caller. If there is no plan, no explicit approval, or the plan was revised after approval, stop and say approval is needed; send the user back to the planning and approval steps. Do not plan or investigate here, and do not ask for approval yourself in a way that bypasses that review.

**No exceptions, and nothing is too small.** A user saying "just do it", pasting a description of the change, or a one-line fix does not count as an approved plan. Without an approved plan file, make **zero** edits: no Edit, no Write, no test files. Reply only with what is missing and that they should run `planning` and approve its plan. Stop there.
- If the plan is vague (no concrete what/why per file), send it back to `planning` rather than filling gaps yourself.

## Process

1. **Re-read the plan.** Read the plan file at the path `planning` passed (under `plans/` in the working directory); it may have been edited by the user, so it overrides any copy in chat. Extract the allowed file list (Files), the ordered Changes, Tests, and Verification commands. This list is your allowlist.
2. **Confirm the repo hasn't unexpectedly changed.** Read every file the plan says to modify and check it still matches what the plan assumes (the code, signatures, and lines it refers to exist). If it is a git repo, also run `git status` and `git diff`; unexpected uncommitted changes in planned files, or a different branch/HEAD than the plan assumed, means stop and report. If not a git repo, the file check is the whole check.
3. **Make only the required changes**, in the plan's order, one file at a time. Touch only allowlisted files.
4. **Follow existing project patterns.** Match neighboring code: naming, error handling, imports, formatting, test style. Reuse the abstractions the plan names.
5. **Add/update tests** exactly as the plan's Tests section says, including the regression test that fails before and passes after, using the project's existing test framework. If the plan says the project has no tests, add none. Never install or add a test framework or any dev dependency (Vitest, Jest, Testing Library and the like); if the plan seems to need one, stop and report it.
6. **Avoid unrelated refactoring.** No renames, reformatting, cleanup, dependency bumps, or "while I'm here" edits. Note noticed issues under Deviations as "out of scope, not touched".
7. **Verify.** Run the plan's Verification commands, narrowest first. Report failures as they are; don't edit outside the allowlist to make them pass.
8. **Summarize** using the Output Format.

## Plan-Constrained Rule

Before every edit, ask: is this file in the plan, and is this change described by it?

If the answer is no and the change is legitimately required, **stop before editing** and respond with:

```
The approved plan is insufficient because ...

Additional file required:
`path/to/file`

Reason:
...

Approval required to continue.
```

Then wait. Do not make the edit, do not make it "temporarily", and do not continue with other steps that depend on it. Files already changed stay as they are and are listed in the report.

Extra changes that always need approval: `package.json` or lockfiles, config/CI files, README/docs, files not in the plan, new dependencies, deleting files, changing public APIs beyond the plan.

## Red Flags - Stop and Re-check

| Thought | Reality |
|---------|---------|
| "It's just one line in another file" | Not in the plan means ask first. |
| "I'll add a dependency to make this easier" | Needs approval. |
| "This nearby code is ugly, I'll tidy it" | Unrelated refactoring. Don't. |
| "The plan is slightly wrong, I'll adjust" | That's a deviation. Stop and explain. |
| "The tests fail, I'll tweak another file" | Report it. Don't widen scope silently. |
| "It's trivial / the user said just do it, no plan needed" | No approved plan file means no edits. Send them to `planning`. |
| "I'll skip re-reading, I just saw the plan" | Re-read it and check the repo state. |
| "I'll update the README too" | Only if the plan lists it. |

## Output Format

Respond in exactly this structure. Write "None" rather than omitting a section.

```
## Execution

### Changed

- `src/foo.ts`
- `src/foo.test.ts`

### Implementation

- What was done in each file, and how it maps to the plan.

### Tests Added/Updated

- Test name and what it asserts.
- Verification commands run and their results (pass/fail, honestly).

### Deviations From Plan

None
```

If any deviation occurred (an approved extra file, a skipped step, an out-of-scope issue noticed), list it here with the reason.

## Common Mistakes

- Implementing without an approved plan because the change looked small.
- Editing files not listed in the plan without asking.
- Skipping the repo-state check before editing.
- Bundling cleanup or formatting into the change.
- Reporting "tests pass" without running them, or hiding failures.
- Filling in a vague plan by guessing instead of sending it back.
