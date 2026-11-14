'use strict';

/** Pure helpers for the daily job counter (see QueueService.bumpDailyCounter).
 *
 * Totalling design (span-delta, since the 2026-11-10 fix): many edge isolates
 * serve traffic in parallel, each with its own in-memory count. Writing each
 * isolate's CUMULATIVE total with a max-guard (the first design) silently
 * undercounted: the stored value became whichever isolate had run longest,
 * and fresh isolates' counts never landed at all (proven live: 10 sequential
 * generations produced no stored key). Instead, each isolate measures one
 * SPAN of consecutive finished jobs and adds that span onto the stored value
 * exactly once — spans are disjoint per isolate, so the totals converge.
 * Bounded loss, disclosed in the stats notes: a recycled isolate's partial
 * span (<10) never flushes, and a span whose flush races another isolate's
 * can be overwritten (<10) — together a busy day can read ~10-20 low.
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

/**
 * Totalling-race fix (2026-11-10): several edge isolates keep separate in-memory
 * counts, and the stored value is the MAX of the submissions any isolate makes —
 * so with two busy isolates the stored total could read just the larger isolate's
 * count (proven live: 10 sequential jobs landed on 2+ isolates and the key never
 * appeared). Each isolate therefore measures ONE span of `span` consecutive
 * finished jobs and then adds that span onto the stored value (read-add-write),
 * once. Spans are disjoint per isolate and each is added exactly once, so the
 * stored value converges to the true total. The one honesty cost: if two
 * isolates flush at the same instant, the second read can miss the first write
 * and that span is lost — bounded by the spans in flight (< span each). Losing
 * a whole isolate's count (the old behaviour) was the bigger evil.
 * @param {number} span  Jobs finished in the span being reported.
 * @returns {{kind:'delta', amount:number}|{kind:'noop'}}
 */
function isolateDelta(span) {
  const n = Number.isFinite(span) ? Math.floor(span) : 0;
  if (n <= 0) return { kind: 'noop' };
  return { kind: 'delta', amount: n };
}

/**
 * Bucket a finished job's final error message into one short reason label
 * (added 2026-11-14, owner's go). The daily counter previously stored only
 * HOW MANY jobs failed, never WHY — three bad days in a row (11–13 Nov 2026)
 * could not be attributed. The load balancer's final error reads
 * "All providers failed. Last error: …" where the last error comes from the
 * last provider tried, so the message usually names the failing layer.
 * Order matters: rate-limiting is checked before provider names because a
 * throttled Azure reply mentions both.
 */
function classifyFailure(message) {
  const m = String(message || '').toLowerCase();
  if (!m) return 'unknown';
  if (m.includes('429') || m.includes('rate limit') || m.includes('rate_limit') || m.includes('throttl') || m.includes('too many requests')) return 'rate-limit-429';
  if (m.includes('could not be stored') || m.includes('storage')) return 'storage';
  if (m.includes('timeout') || m.includes('timed out') || m.includes('abort')) return 'timeout';
  if (m.includes('azure') || m.includes('cognitive') || m.includes('speech.microsoft')) return 'azure-error';
  if (m.includes('edge') || m.includes('websocket') || m.includes('socket') || m.includes('wss')) return 'edge-error';
  return 'other';
}

module.exports = { nextIsolateCount, shouldFlush, isolateDelta, classifyFailure };
