import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  canMoveTo, moveTicket, approveReview, sendBack, approveDeploy, close, WorkflowError,
} from '../src/workflow.js';

const NOW = new Date('2026-10-27T06:00:00.000Z');
const BA = { name: 'Aisyah', role: 'ba' };
const TL = { name: 'Daniel', role: 'tl' };
const DEV = { name: 'Wei Ming', role: 'developer' };
const INFRA = { name: 'Ravi', role: 'infra' };

function ticket(overrides = {}) {
  return {
    id: 'KZ-1',
    title: 'Test ticket',
    status: 'Open',
    assignee: 'Wei Ming',
    reviewApproved: false,
    qat: [],
    deployApprovedBy: null,
    history: [{ status: 'Open', at: '2026-10-20T01:00:00.000Z' }],
    ...overrides,
  };
}

describe('moving a ticket', () => {
  it('moves to the next step and records it in the history', () => {
    const moved = moveTicket(ticket(), 'Analysis', NOW);
    assert.equal(moved.status, 'Analysis');
    assert.deepEqual(moved.history.at(-1), { status: 'Analysis', at: NOW.toISOString() });
  });

  it('refuses to skip steps', () => {
    assert.throws(() => moveTicket(ticket(), 'Deployed', NOW), WorkflowError);
  });
});

describe('code review', () => {
  it('only a TL can approve a review', () => {
    const t = ticket({ status: 'Code Review' });
    assert.equal(approveReview(t, TL).reviewApproved, true);
    assert.throws(() => approveReview(t, DEV), WorkflowError);
  });

  it('a ticket needs an approved review before staging', () => {
    const t = ticket({ status: 'Code Review' });
    assert.equal(canMoveTo(t, 'Staging Testing').ok, false);
    assert.equal(canMoveTo({ ...t, reviewApproved: true }, 'Staging Testing').ok, true);
  });
});

describe('release gate (pre-release preparation)', () => {
  it('allows Pending Production when the QAT sub-ticket is Resolved', () => {
    const t = ticket({ status: 'Staging Testing', qat: [{ id: 'Q1', status: 'Resolved' }] });
    assert.equal(canMoveTo(t, 'Pending Production').ok, true);
  });

  it('blocks Pending Production when the QAT sub-ticket is Open', () => {
    const t = ticket({ status: 'Staging Testing', qat: [{ id: 'Q1', status: 'Open' }] });
    assert.equal(canMoveTo(t, 'Pending Production').ok, false);
  });
});

describe('staging bounce-back', () => {
  it('sends the ticket back to In Progress with the reason', () => {
    const t = ticket({ status: 'Staging Testing', reviewApproved: true });
    const back = sendBack(t, 'Export button does nothing', NOW);
    assert.equal(back.status, 'In Progress');
    assert.equal(back.lastSendBackReason, 'Export button does nothing');
  });
});

describe('infra approval', () => {
  it('a developer cannot approve a deploy', () => {
    const t = ticket({ status: 'Pending Production' });
    assert.throws(() => approveDeploy(t, DEV), WorkflowError);
  });

  it('infra can approve a deploy', () => {
    const t = ticket({ status: 'Pending Production' });
    assert.equal(approveDeploy(t, INFRA).deployApprovedBy, 'Ravi');
  });
});

describe('closing a ticket', () => {
  it('a BA closes a deployed ticket', () => {
    const t = ticket({ status: 'Deployed' });
    assert.equal(close(t, BA, NOW).status, 'Closed');
  });

  it('a developer cannot close a ticket', () => {
    const t = ticket({ status: 'Deployed' });
    assert.throws(() => close(t, DEV, NOW), WorkflowError);
  });
});
