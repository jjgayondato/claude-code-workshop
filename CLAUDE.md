# Ticket Board

A ticket board that follows our SDLC. Plain JavaScript, Node 18+, no packages.

## Commands
- Test: `node --test`
- Run: `node server.js`, then open http://localhost:3000

## Layout
- `src/workflow.js` — the ticket rules: which step can follow which, and who may approve.
- `src/timeInStep.js` — days in each step.
- `server.js` — built-in http server and the JSON API.
- `public/` — the board in the browser.
- `tickets/` — the stories we work on.

## Rules
- Do not add npm packages. Use Node's built-in modules.
- Every rule change gets a test first. Run `node --test` and show the result before you say "done".
- A rule that limits who can do something uses an allow list (`role === 'infra'`), never a block list.
- Pass `now` into time functions. Tests use a fixed date, never the real clock.
- Never read or print `.env`. Ask the developer for the one value you need.
- Commit messages: `<type>(<scope>): <subject>`, imperative, 50 characters max. Add the ticket id, e.g. `fix(workflow): check all QAT sub-tickets (KZ-101)`.
- Never push. The developer pushes.
