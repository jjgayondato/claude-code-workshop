// How long a ticket stayed in each step, in whole days.
// Started last sprint for the "days in step" badge on the board.

const DAY_MS = 24 * 60 * 60 * 1000;

export function stepDurations(ticket) {
  return ticket.history.map((entry, i) => {
    const start = new Date(entry.at);
    const end = new Date(ticket.history[i + 1]?.at);
    return { status: entry.status, days: Math.floor((end - start) / DAY_MS) };
  });
}

export function daysInCurrentStep(ticket, now = new Date()) {
  const durations = stepDurations(ticket);
  return durations[durations.length - 1].days;
}
