const board = document.getElementById('board');
const userSelect = document.getElementById('user');
const message = document.getElementById('message');

let state = { statuses: [], users: [], tickets: [] };

function show(text, isError = false) {
  message.textContent = text;
  message.className = isError ? 'error' : 'ok';
}

async function load() {
  state = await (await fetch('/api/board')).json();
  if (!userSelect.options.length) {
    for (const u of state.users) {
      userSelect.add(new Option(`${u.name} (${u.role.toUpperCase()})`, u.name));
    }
  }
  render();
}

async function act(id, action, body = {}) {
  const res = await fetch(`/api/tickets/${id}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, user: userSelect.value }),
  });
  const data = await res.json();
  if (res.ok) show(`${id}: done`);
  else show(data.error, true);
  await load();
}

function button(label, onClick) {
  const b = document.createElement('button');
  b.textContent = label;
  b.addEventListener('click', onClick);
  return b;
}

function card(t) {
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="top"><strong>${t.id}</strong><span class="days">${t.daysInStep} days</span></div>
    <p>${t.title}</p>
    <small>${t.assignee ?? 'Unassigned'}${t.reviewApproved ? ' · review approved' : ''}${t.deployApprovedBy ? ` · deploy approved by ${t.deployApprovedBy}` : ''}</small>
    <ul class="qat">${t.qat.map((q) => `<li class="${q.status.toLowerCase()}">${q.id}: ${q.status}</li>`).join('')}</ul>`;

  const actions = document.createElement('div');
  actions.className = 'actions';
  const next = state.statuses[state.statuses.indexOf(t.status) + 1];
  if (next && next !== 'Closed') actions.append(button(`→ ${next}`, () => act(t.id, 'move', { to: next })));
  if (t.status === 'Code Review') {
    actions.append(button('Approve review', () => act(t.id, 'approveReview')));
    actions.append(button('← In Progress', () => act(t.id, 'move', { to: 'In Progress' })));
  }
  if (t.status === 'Staging Testing') {
    actions.append(button('Send back', () => {
      const reason = prompt('What did QA find?');
      if (reason) act(t.id, 'sendBack', { reason });
    }));
  }
  if (t.status === 'Pending Production') actions.append(button('Approve deploy', () => act(t.id, 'approveDeploy')));
  if (t.status !== 'Closed') actions.append(button('Close', () => act(t.id, 'close')));
  el.append(actions);
  return el;
}

function render() {
  board.replaceChildren(...state.statuses.map((status) => {
    const col = document.createElement('section');
    col.className = 'column';
    const items = state.tickets.filter((t) => t.status === status);
    col.innerHTML = `<h2>${status} <span>${items.length}</span></h2>`;
    col.append(...items.map(card));
    return col;
  }));
}

load();
