const BASE = require("../config.json").apiBase;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Bounded-concurrency limiter shared by all callers so total in-flight
// requests never exceeds `concurrency`, regardless of how many call sites
// are invoking apiGet at once.
class Limiter {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.active = 0;
    this.queue = [];
  }
  async run(fn) {
    if (this.active >= this.concurrency) {
      await new Promise((resolve) => this.queue.push(resolve));
    }
    this.active++;
    try {
      return await fn();
    } finally {
      this.active--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

// Hard safety net: never exceed this many actual HTTP requests in any
// rolling 60s window, independent of --concurrency/--delay-ms. Every real
// fetch() call (including retries) consumes a slot. Default sits below the
// "don't hit 100 req/min" ceiling to leave margin for clock drift.
class RateGate {
  constructor(maxPerMinute) {
    this.maxPerMinute = maxPerMinute;
    this.timestamps = []; // ms epoch of each request in the trailing window
  }
  setMax(n) {
    this.maxPerMinute = n;
  }
  async acquire() {
    while (true) {
      const now = Date.now();
      this.timestamps = this.timestamps.filter((t) => now - t < 60000);
      if (this.timestamps.length < this.maxPerMinute) {
        this.timestamps.push(now);
        return;
      }
      const waitMs = 60000 - (now - this.timestamps[0]) + 10;
      await sleep(waitMs);
    }
  }
}

let limiter = new Limiter(3);
let delayMs = 250;
const rateGate = new RateGate(90);

function configureRateLimit({ concurrency, delayMs: d, maxPerMinute }) {
  if (concurrency) limiter = new Limiter(concurrency);
  if (d !== undefined) delayMs = d;
  if (maxPerMinute) rateGate.setMax(maxPerMinute);
}

async function apiGet(path, { retries = 5 } = {}) {
  const token = process.env.HEADOUT_SANDBOX_TOKEN;
  if (!token) {
    throw new Error("Missing HEADOUT_SANDBOX_TOKEN env var (Headout-Auth token).");
  }
  return limiter.run(async () => {
    let attempt = 0;
    while (true) {
      attempt++;
      await rateGate.acquire();
      let res;
      try {
        res = await fetch(`${BASE}${path}`, {
          headers: { "Headout-Auth": token },
        });
      } catch (networkErr) {
        // DNS blips / connection resets are transient, not "the API said no" —
        // retry them the same as 429/5xx instead of surfacing as a real failure.
        if (attempt <= retries) {
          const backoff = Math.min(30000, 500 * 2 ** attempt) + Math.random() * 250;
          console.error(`  [network-retry] ${path} -> ${networkErr.message}, retry ${attempt}/${retries} in ${Math.round(backoff)}ms`);
          await sleep(backoff);
          continue;
        }
        throw networkErr;
      }
      if (res.ok) {
        await sleep(delayMs);
        return res.json();
      }
      if ((res.status === 429 || res.status >= 500) && attempt <= retries) {
        const backoff = Math.min(30000, 500 * 2 ** attempt) + Math.random() * 250;
        console.error(`  [rate-limit/retry] ${path} -> ${res.status}, retry ${attempt}/${retries} in ${Math.round(backoff)}ms`);
        await sleep(backoff);
        continue;
      }
      const body = await res.text().catch(() => "");
      throw new Error(`GET ${path} failed: ${res.status} ${body.slice(0, 200)}`);
    }
  });
}

module.exports = { apiGet, configureRateLimit, sleep };
