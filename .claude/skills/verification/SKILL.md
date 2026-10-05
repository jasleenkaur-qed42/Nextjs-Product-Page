---
name: verification
description: Use when an implementation (typically an execute report) is finished and the question is whether it actually solved the problem without breaking anything else - before calling the work done, committing, or opening a PR.
allowed-tools: mcp__chrome-devtools, Write(./evidence/**), Read, Grep, Glob, Bash(git log:*), Bash(git diff:*), Bash(git show:*), Bash(git status:*), Bash(git branch:*), Bash(ls:*), Bash(cat:*), Bash(head:*), Bash(tail:*), Bash(wc:*), Bash(find:*), Bash(grep:*), Bash(rg:*), Bash(npm test:*), Bash(npm run:*), Bash(pnpm test:*), Bash(pnpm run:*), Bash(yarn test:*), Bash(yarn run:*), Bash(npx tsc:*), Bash(npx eslint:*), Bash(npx prettier --check:*), Bash(npx jest:*), Bash(npx vitest:*), Bash(make:*), Bash(cargo test:*), Bash(cargo check:*), Bash(cargo clippy:*), Bash(go test:*), Bash(go vet:*), Bash(go build:*), Bash(pytest:*), Bash(python -m pytest:*), Bash(ruff check:*), Bash(mypy:*)
---

# Verification (Did It Actually Work?)

## Overview

Answers: **did the implementation solve the problem without introducing another one?** Run the project's checks, review the diff, and report honestly. This skill never changes the project.

**Core principle:** Evidence before claims. A check counts only if you ran it and saw its output in this run. Never report "passes" from memory, from the execute report, or from reading code.

## Read-Only Rules

**Never:** edit or create project files (the one exception is evidence files under `evidence/<KEY>/`, see Evidence), run auto-fixers (`--fix`, `--write`, `prettier --write`, `cargo fmt`, `go fmt`), install dependencies, run migrations, or use `git add/commit/checkout/reset/stash`. If a check fails, report it. Fixing goes back through `planning` and `execute`.

Checks that write build output (`build`) are allowed only if the command is a plain build script; say so in the report. If a check would need network, credentials, an SDK, or a device you don't have, mark it **Not run** with the reason. Never fake or skip silently.

## Input

- The approved plan and execute report, if present. They say what should have changed and which tests are targeted; treat them as claims to check against the diff, not as evidence.
- If neither exists, derive the intended change from the user's description and the diff. If you cannot tell what the change was meant to do, ask.

## Detect Available Commands

Never assume a command exists. Discover it first:

| Check | Where to look |
|-------|---------------|
| Tests | `scripts` in package.json (`test`, `test:*`), Makefile targets, `pytest.ini`/`pyproject.toml`, `Cargo.toml`, `go.mod`, CI config |
| Lint | `lint` script; `.eslintrc*`/`eslint.config.*`; `ruff`/`clippy` config |
| TypeScript | `typecheck`/`tsc` script; `tsconfig.json` (then `npx tsc --noEmit`) |
| Build | `build` script, Makefile, CI config |
| Formatting | `format:check`/`prettier` script; `.prettierrc*`; use check mode only |

Prefer the project's own script over a raw tool call, and use the package manager the lockfile indicates. Prefer what CI runs. If a check has no config or script, mark it **Not applicable**, not passed.

## Process

1. **Inspect the diff.** `git status` and `git diff` (also `--stat`). If not a git repo, use the files named by the execute report and say diff review is limited. List changed files and compare against the plan: anything unexpected, missing, or unrelated (debug code, stray files, lockfile churn, config edits) is a finding.
2. **Test the change itself, whatever its size.** A one-line change is verified like any other. Find the test(s) that exercise the changed line or behavior, run them narrowest first, and confirm they pass. Confirm the regression test exists; if the tooling permits, check it would have failed without the fix, otherwise say that was not checked.
   - If no test covers the changed behavior, that is a finding, not a pass: report Targeted Tests as ❌ **No test covers the change** (or ⚠️ Not run with the reason if the project has no test setup). Verification cannot write tests, so the result is Not verified and the fix goes back through `planning` and `execute`.
   - For a web UI change, the Browser check below also counts as testing the change. Run it even when the diff is one line.
   - Never skip this step because the diff is small, the change looks obviously correct, or the broader suite is green.
3. **Run relevant checks.** Only those detected and touched by the change: TypeScript, lint, formatting (check mode), build.
   - **Browser check.** If the change affects anything visible or behavioral in a web page, or the original problem was reproduced in the browser, re-run that exact reproduction with Chrome DevTools (see Browser Verification).
4. **Run the broader test suite** to look for collateral damage.
5. **Inspect the final diff again.** Confirm the checks did not modify anything (`git status` is unchanged from step 1), and re-check for untracked or generated files.
6. **Report** in the Output Format.

Run every check even if an earlier one fails, unless a failure makes the next one meaningless (e.g. build cannot run because dependencies are missing). Say which.

## Browser Verification (Chrome DevTools)

Unit tests do not prove a browser symptom is gone. When the change touches a web UI, or the investigation reproduced the problem in a browser, verify it there using the Chrome DevTools MCP tools (`mcp__chrome-devtools__*`).

1. Reuse the investigation's reproduction steps and URL exactly. Run them against the changed code (dev server running, or started with an existing project script; restart only if the project needs it).
2. Confirm the original symptom is **gone**: the console error no longer appears, the failing request now succeeds, the layout or behavior is correct. Compare against the investigation's captured evidence.
3. Check for **new** problems: no new console errors or warnings, no new failed network requests, and the neighboring flows the diff touches still behave. Take a screenshot or snapshot as evidence.
4. Read-only: don't submit destructive actions against real data, and use `evaluate_script` only to read state.
5. If the tools are unavailable, the app cannot be started, or no reproduction steps exist, report Browser as ⚠️ Not run with the reason. Never mark it passed from the test results.

## Evidence

Save proof for the PR and the ticket under `evidence/<KEY>/` (the key comes from the orchestrator; use the plan slug if none):
- Browser changes: an `after-<n>-<what>.png` screenshot for each step that matches an investigation `before-*` screenshot, taken with the screenshot tool's file path.
- Always: `test-output.txt` with the command and the key output lines (counts, failures) of the targeted tests and checks, written with Write. Copy real output only.
- Never save anything with secrets, tokens, cookies or personal data. Report each file path in the output under Evidence, and list gaps (no browser, no UI) as Not captured with the reason.

## Red Flags - Stop and Re-check

| Thought | Reality |
|---------|---------|
| "The execute report says tests passed" | That's a claim. Run them. |
| "It should pass" / "it's a tiny change" | Should is not evidence. Run it. |
| "It's a one-line change, the broader suite is enough" | Test the changed behavior directly. No covering test means Not verified. |
| "Lint failed, I'll run --fix" | Read-only. Report it. |
| "Full suite is slow, skip it" | Mark it Not run with the reason; don't imply it passed. |
| "This failure was already there" | Confirm (e.g. against the base) or say it is unconfirmed. |
| "No build script, so build passed" | That's Not applicable. |
| "Tests pass, so the UI bug is fixed" | Re-run the browser reproduction in Chrome DevTools. |
| "Only tests I wrote pass, good enough" | Broader suite and diff review are the point. |

## Output Format

Include a section for each check that applies or was considered; omit checks that don't exist in the project only if you list them under Result as Not applicable. Use ✅ passed, ❌ failed, ⚠️ not run (with **Reason**), and include the command run and the counts or the key failure lines.

```
## Verification

### Targeted Tests
✅ 12 passed
Command: `npm test -- price`

### TypeScript
✅ Passed

### ESLint
✅ Passed

### Formatting
✅ Passed

### Browser (Chrome DevTools)
✅ Original error no longer reproduces; no new console errors
Steps: open `/cart`, apply coupon

### Build
⚠️ Not run

Reason:
Android SDK unavailable

### Broader Tests
✅ 240 passed

### Diff Review
✅ Only expected files changed

### Evidence
`evidence/PROJ-123/after-1-cart.png`, `evidence/PROJ-123/test-output.txt`

### Result

Implementation verified against the available checks.

Remaining limitation:
Android build could not be verified.
```

Result rules:
- Any ❌ means **Result: Not verified**, followed by the failing check, the key output, and the likely owner (the change, or pre-existing/unrelated with evidence).
- Only ✅ and Not applicable: "Implementation verified against the available checks."
- Any ⚠️ Not run: still say "verified against the available checks" only if the rest passed, and list each gap under **Remaining limitation**. Never write a bare "all good".
- Diff surprises (unplanned files, leftover debug code) are reported under Diff Review as ⚠️ or ❌, even when all commands pass.

## Common Mistakes

- Reporting a check as passed without running it in this session.
- Assuming `npm test`, `tsc`, or `eslint` exist without looking.
- Running a fixer or formatter in write mode.
- Running only the new tests and skipping the broader suite.
- Skipping the targeted test because the change is only a line or two.
- Passing a change that no test exercises.
- Treating "not run" or "not applicable" as a pass.
- Verifying a browser bug only with unit tests.
- Skipping the diff review because the commands were green.
- Fixing a failure instead of reporting it.
