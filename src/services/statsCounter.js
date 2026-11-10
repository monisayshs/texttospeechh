'use strict';

/**
 * Pure helpers for the daily job counter (see QueueService.bumpDailyCounter).
 *
 * Why "cumulative rewrite" instead of read-add-write per job:
 * - Only ONE writer exists per isolate at a time for a given day+kind (the
 *   isolate's own submissions are sequential — each /api/generate request
 *   runs createJobAsync to completion before the next flush decision), so
 *   within an isolate the read-modify-write cannot race itself.
 * - Across isolates, last-writer-wins on the CUMULATIVE total can undercount
 *   if a stale isolate overwrites a newer total. The guard below makes a
 *   flush write only when it would INCREASE the stored value, and every
 *   isolate's cumulative total only ever grows over the day — so a stale
 *   isolate's write is either bigger (real progress) or skipped. The worst
 *   remaining case is the well-known one: the final partial batch (<50 jobs)
 *   of a recycled isolate never flushes. That bounded loss is the explicit
 *   trade for not doubling KV writes.
 */

/**
 * The value to persist for today's counter.
 * @param {number} stored  Value currently in KV (0 when the key is absent).
 * @param {number} mine    This isolate's cumulative finished-job count today.
 * @returns {number} max(stored, mine) — the caller writes only on increase.
 */
function nextIsolateCount(stored, mine) {
  const s = Number.isFinite(stored) ? stored : 0;
  const m = Number.isFinite(mine) ? mine : 0;
  return Math.max(s, m);
}

/** Should a flush happen after finishing a job? (crossed a multiple of step) */
function shouldFlush(count, step) {
  return count > 0 && count % step === 0;
}

module.exports = { nextIsolateCount, shouldFlush };
