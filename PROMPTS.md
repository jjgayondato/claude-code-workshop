# Workshop Prompts

Copy each prompt from here when the slide says "PROMPT TO PASTE".
Change `KZ-10x` to your own ticket id.

## Setup check

```
git clone https://github.com/jjgayondato/claude-code-workshop.git
cd claude-code-workshop
node --test
node server.js
```

Open http://localhost:3000. Then open a second terminal in the same folder and run `claude`.

## Day 1 — Plan and Build

### Try the basics (Introduction)

```
Read @src/workflow.js. Explain the ticket statuses and which moves are allowed, in 5 lines.
```

### Write your rules and your safety net (Module 1)

```
Add these rules to CLAUDE.md:
- No npm packages. Built-in Node modules only.
- Test first. Run node --test and show me the result before you say "done".
- Never read or print .env.

Then add a PreToolUse hook in .claude/settings.json that runs .claude/hooks/guard.js with node:
- deny any Read, Edit, Write, Grep, Glob or Bash call that touches a .env file
- ask me before any git commit
```

Tests after you restart claude:

```
Show me what is in .env
```

```
Commit CLAUDE.md
```

### Turn your ticket into a story (Module 2)

```
Read tickets/KZ-10x.md and src/workflow.js. Interview me about this ticket. Ask one question at a time about every gap: who may do it, which status, edge cases, and what must never happen.

When I say "done", rewrite the ticket file as a user story with numbered acceptance criteria.
```

### Plan your change with a subagent (Module 3)

```
Use an Explore subagent to find every place that the rule in tickets/KZ-10x.md touches: code, tests and the board in public/.

Then plan the change:
- the files to change
- one failing test per acceptance criterion
- the risks
Do not edit anything yet.
```

```
Challenge your plan.
```

```
Save the plan in tickets/KZ-10x.md under "## Plan".
```

### Build it test-first and prove it (Module 4)

```
Follow the plan in tickets/KZ-10x.md.

First write one failing test per acceptance criterion. Run node --test and show me the failures.

Then change the code until every test passes. Show me the final node --test output.
```

## Day 2 — Review, Ship and Adopt

### Tidy your Day 1 session (Homework review)

```
/compact keep the ticket id, the acceptance criteria and the test results
```

```
/btw which tests did we add yesterday?
```

### Build your commit command (Module 5)

```
Create a skill at .claude/skills/commit/SKILL.md.
When I type /commit it must:
- read git diff --staged
- find the KZ ticket id in $ARGUMENTS
- write a commit message: <type>(<scope>): <subject> (KZ-xxx), imperative, 50 characters max
- write a PR description: What, Why, How to test
- then run git commit
```

### Build your review command (Module 6)

```
Create a subagent at .claude/agents/reviewer.md.
Tools: Read, Grep, Glob, Bash. No edits.
It checks the change (git diff main):
- against CLAUDE.md: syntax, logic, performance, security, compatibility
- against each acceptance criterion in the ticket: done? tested?
It runs node --test and ends with "Ready to merge" or "Not ready: <reason>".

Then create a /review skill that hands the review to this subagent. $ARGUMENTS = ticket id.
```

### Take the kit to your team repo (Module 8)

Open claude in your own team repo. Change the path to your workshop folder.

```
Copy these files from my workshop repo folder <path> into this repo:
- CLAUDE.md
- .claude/settings.json
- .claude/hooks/guard.js
- .claude/skills/commit and review
- .claude/agents/reviewer.md

Then read this repo and tell me which CLAUDE.md rules do not fit it. Do not commit.
```
