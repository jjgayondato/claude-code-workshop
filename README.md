# Claude Code Workshop — Ticket Board

A small ticket board for the Claude Code workshop. Tickets move through the
team SDLC: Open → Analysis → In Progress → Code Review → Staging Testing →
Pending Production → Deployed → Closed.

No packages to install. Plain JavaScript on Node 18 or newer.

## Start

```
git clone https://github.com/jjgayondato/claude-code-workshop.git
cd claude-code-workshop
node --version   # must be 18 or newer
node --test      # all tests pass
node server.js   # open http://localhost:3000
```

Use "Acting as" at the top of the board to switch between BA, TL,
developer and Infra users.

## Your task

Pick one ticket in `tickets/`:

| Ticket | What it is about | SDLC step |
|---|---|---|
| KZ-101 | Release gate (trainer demo) | 9–10 |
| KZ-102 | Send failed tickets back | 8 |
| KZ-103 | Infra approval before deploy | 10 |
| KZ-104 | BA closes the ticket | 11 |
| KZ-105 | Days in each step (bonus) | all |

Each ticket is a first draft. It has gaps, and the code around it has a bug
that the tests do not catch yet. Find both with Claude.

## Rules for the workshop

- Do not push. Commit on your own laptop only.
- `.env` holds FAKE values. It is in the repo on purpose, for the hook demo.
  Never commit a real `.env`.
- Stuck? The `solutions` branch has a finished setup:
  `git diff main solutions -- .claude CLAUDE.md`
