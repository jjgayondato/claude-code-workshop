---
name: review
description: Review the current change against our coding standards AND the ticket story. Use when the developer asks for a review, or types /review KZ-xxx.
---

Hand the review to the `reviewer` subagent, so it reads the change with fresh eyes.

Give it:
- the ticket file: `tickets/$ARGUMENTS.md` (ask for the ticket id if $ARGUMENTS is empty)
- the diff: `git diff main`

Then show its report to the developer as it is. Do not fix anything yet.
