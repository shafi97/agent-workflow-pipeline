# Agent Workflow and Secure Pipeline

A template for building features with several Claude Code subagents, each with one job and limited tools, plus a CI pipeline that checks every change for bugs and security problems. The sample feature is a business-hours SLA calculator: "answer within 8 business hours" done right across nights, weekends and holidays.

Personal project, built with Claude Code and reviewed by hand.

## The problem
AI agents write code fast, but one agent that writes, tests and approves its own work will miss things. This setup splits the roles, keeps reviewers read-only, and lets the pipeline decide whether a change is safe to merge.

## The agents ([.claude/agents](.claude/agents))
| Agent | Job | Can edit files? |
|---|---|---|
| `spec-writer` | Turns a request into a spec with numbered acceptance criteria | Writes specs only |
| `builder` | Implements the spec in small steps | Yes |
| `tester` | Writes tests from the criteria (not from the code) | Yes |
| `reviewer` | Checks the diff for bugs and spec drift | No |
| `security-reviewer` | Looks for secrets, injection, unsafe patterns, risky dependencies | No |

`/ship <feature request>` ([.claude/commands/ship.md](.claude/commands/ship.md)) runs them in order: spec, build, test, review, security review, fix loop (at most two rounds), final checks.

## The sample feature
[specs/sla.md](specs/sla.md) has 10 acceptance criteria. [src/sla.ts](src/sla.ts) has `addBusinessHours` and `businessMinutesBetween`, and [src/sla.test.ts](src/sla.test.ts) has 14 tests named after the criteria. One of them checks that adding N minutes and then measuring gives back N, so the two functions cannot drift apart. The same module is used by my Change Desk project.

## The pipeline ([.github/workflows](.github/workflows))
- **CI:** type check and tests.
- **Secrets:** my own scanner (`npm run scan:secrets`) and gitleaks.
- **Audit:** `npm audit` fails on high severity issues.
- **CodeQL:** static analysis on every push, pull request and weekly.
- **Dependency review:** blocks pull requests that add high severity dependencies.
- **Dependabot:** weekly update pull requests for npm and GitHub Actions.

Run the same checks locally with `npm run check`.

## Honest status
- Tested and run: the SLA module, the type check, the secret scan and `npm audit`.
- Written but not exercised end to end: the `/ship` command and the agent definitions. They are a working template; I have not published a recorded run of all five agents on a new feature yet.
- The GitHub workflows run for the first time when the repo is pushed.
- No cloud deployment is part of this project.
