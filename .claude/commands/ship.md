---
description: Run the full spec, build, test, review, security-review loop for a feature
argument-hint: <feature request>
---
Feature request: $ARGUMENTS

Run these steps in order, using the named subagents. Do not skip a step.

1. **spec-writer**: write the spec. If it lists open questions, stop and ask me.
2. **builder**: implement the spec.
3. **tester**: write tests from the acceptance criteria and run them.
4. **reviewer** and **security-reviewer**: run both on the changes (they can run in parallel).
5. If either reports a must-fix or a high or medium security finding, send it to **builder**, then re-run **tester**. Repeat at most twice.
6. Run `npm run check`.
7. Summarise: criteria met, tests passing, review and security findings and how each was handled, anything left open.
