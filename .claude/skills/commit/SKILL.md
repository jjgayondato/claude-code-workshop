---
name: commit
description: Write a commit message and a PR description from the staged diff. Use when the developer asks to commit, or types /commit.
---

1. Run `git diff --staged`. If nothing is staged, stop and say so.
2. Find the ticket id (KZ-xxx) in the branch name, the diff or $ARGUMENTS.
3. Write the commit message: `<type>(<scope>): <subject> (KZ-xxx)`.
   - type: feat | fix | test | refactor | docs | chore
   - subject: imperative, 50 characters max
   - body: what changed and why, in 1–3 short lines
4. Write a PR description below it:
   - **What** — one line
   - **Why** — the ticket id and the rule it adds or fixes
   - **How to test** — the exact command
5. Show both. Then run `git commit` with the message. The hook will ask the developer to approve.
