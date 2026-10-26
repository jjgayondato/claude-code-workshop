import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { stepDurations } from '../src/timeInStep.js';

describe('time in step', () => {
  it('counts whole days between two steps', () => {
    const t = {
      history: [
        { status: 'Open', at: '2026-10-01T01:00:00.000Z' },
        { status: 'Analysis', at: '2026-10-03T09:00:00.000Z' },
      ],
    };
    assert.equal(stepDurations(t)[0].days, 2);
  });
});
