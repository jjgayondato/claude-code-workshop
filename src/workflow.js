// Ticket workflow for the board.
// The steps follow the team SDLC: request -> analysis -> development ->
// code review -> staging testing -> pre-release -> deployment -> close.

export const STATUSES = [
  'Open',               // SDLC 1-2: request compiled, Jira ticket created
  'Analysis',           // SDLC 3-4: requirement analysis, technical design
  'In Progress',        // SDLC 5: development
  'Code Review',        // SDLC 6: code review
  'Staging Testing',    // SDLC 7-8: merged to staging, QAT
  'Pending Production', // SDLC 9: pre-release preparation
  'Deployed',           // SDLC 10: production deployment
  'Closed',             // SDLC 11: post deployment
];

const NEXT = {
  'Open': ['Analysis'],
  'Analysis': ['In Progress'],
  'In Progress': ['Code Review'],
  'Code Review': ['In Progress', 'Staging Testing'],
  'Staging Testing': ['Pending Production'],
  'Pending Production': ['Deployed'],
  'Deployed': [],
  'Closed': [],
};

export class WorkflowError extends Error {}

function withStatus(ticket, status, now, extra = {}) {
  return {
    ...ticket,
    ...extra,
    status,
    history: [...ticket.history, { status, at: now.toISOString() }],
  };
}

export function canMoveTo(ticket, to) {
  if (!NEXT[ticket.status]?.includes(to)) {
    return { ok: false, reason: `Cannot move ${ticket.id} from ${ticket.status} to ${to}` };
  }
  if (to === 'Staging Testing' && !ticket.reviewApproved) {
    return { ok: false, reason: `${ticket.id} needs an approved code review first` };
  }
  if (to === 'Pending Production' && ticket.qat[0]?.status !== 'Resolved') {
    return { ok: false, reason: `${ticket.id} has QAT sub-tickets that are not Resolved` };
  }
  if (to === 'Deployed' && !ticket.deployApprovedBy) {
    return { ok: false, reason: `${ticket.id} needs Infra approval before deploy` };
  }
  return { ok: true };
}

export function moveTicket(ticket, to, now = new Date()) {
  const check = canMoveTo(ticket, to);
  if (!check.ok) throw new WorkflowError(check.reason);
  return withStatus(ticket, to, now);
}

export function approveReview(ticket, user) {
  if (user.role !== 'tl') throw new WorkflowError(`Only a TL can approve a review, not ${user.role}`);
  if (ticket.status !== 'Code Review') throw new WorkflowError(`${ticket.id} is not in Code Review`);
  return { ...ticket, reviewApproved: true };
}

// QA found an issue in staging: the ticket goes back to development.
export function sendBack(ticket, reason, now = new Date()) {
  if (ticket.status !== 'Staging Testing') {
    throw new WorkflowError(`${ticket.id} is not in Staging Testing`);
  }
  return withStatus(ticket, 'In Progress', now, { lastSendBackReason: reason });
}

export function approveDeploy(ticket, user) {
  if (user.role === 'developer') {
    throw new WorkflowError('A developer cannot approve their own deploy');
  }
  if (ticket.status !== 'Pending Production') {
    throw new WorkflowError(`${ticket.id} is not Pending Production`);
  }
  return { ...ticket, deployApprovedBy: user.name };
}

export function close(ticket, user, now = new Date()) {
  if (user.role !== 'ba') throw new WorkflowError(`Only a BA can close a ticket, not ${user.role}`);
  return withStatus(ticket, 'Closed', now);
}
