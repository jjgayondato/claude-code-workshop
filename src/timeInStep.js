// How long a ticket stayed in each step, in whole days.
// Started last sprint for the "days in step" badge on the board.

const DAY_MS = 24 * 60 * 60 * 1000;

// The current step has no end yet, so it counts until `now`.
export function stepDurations(ticket, now = new Date()) {
  return ticket.history.map((entry, i) => {
    const start = new Date(entry.at);
    const next = ticket.history[i + 1];
    const end = next ? new Date(next.at) : now;
    return { status: entry.status, days: Math.floor((end - start) / DAY_MS) };
  });
}

export function daysInCurrentStep(ticket, now = new Date()) {
  const durations = stepDurations(ticket, now);
  return durations[durations.length - 1].days;
}
