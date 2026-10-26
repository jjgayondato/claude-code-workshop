// Ticket board server. No packages: Node's built-in http module only.
// Run: node server.js   then open http://localhost:3000

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  STATUSES, WorkflowError, moveTicket, approveReview, sendBack, approveDeploy, close,
} from './src/workflow.js';
import { daysInCurrentStep } from './src/timeInStep.js';

const root = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

// The board keeps its tickets in memory. Restart the server to reset them.
let tickets = JSON.parse(await readFile(join(root, 'data/tickets.json'), 'utf8'));
const users = JSON.parse(await readFile(join(root, 'data/users.json'), 'utf8'));

const ACTIONS = {
  move: (t, body) => moveTicket(t, body.to),
  approveReview: (t, body, user) => approveReview(t, user),
  sendBack: (t, body) => sendBack(t, body.reason),
  approveDeploy: (t, body, user) => approveDeploy(t, user),
  close: (t, body, user) => close(t, user),
};

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };

function send(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/api/board') {
    const now = new Date();
    return send(res, 200, {
      statuses: STATUSES,
      users,
      tickets: tickets.map((t) => ({ ...t, daysInStep: daysInCurrentStep(t, now) })),
    });
  }

  const action = url.pathname.match(/^\/api\/tickets\/([\w-]+)\/(\w+)$/);
  if (req.method === 'POST' && action) {
    const [, id, name] = action;
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return send(res, 404, { error: `No ticket ${id}` });
    if (!ACTIONS[name]) return send(res, 404, { error: `No action ${name}` });
    const body = await readBody(req);
    const user = users.find((u) => u.name === body.user);
    if (!user) return send(res, 400, { error: `Unknown user ${body.user}` });
    try {
      const updated = ACTIONS[name](ticket, body, user);
      tickets = tickets.map((t) => (t.id === id ? updated : t));
      return send(res, 200, updated);
    } catch (err) {
      if (err instanceof WorkflowError) return send(res, 409, { error: err.message });
      throw err;
    }
  }

  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  try {
    const content = await readFile(join(root, 'public', file));
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'text/plain' });
    res.end(content);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

server.listen(PORT, () => console.log(`Ticket board: http://localhost:${PORT}`));
