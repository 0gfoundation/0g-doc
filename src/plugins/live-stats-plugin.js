/**
 * Fetches the homepage network stats at build time so the numbers in the
 * server-rendered HTML are current, with a committed fallback so a Chainscan
 * outage never breaks the build. Exposed to components via usePluginData.
 *
 * Source: the 0G Chain explorer API (same endpoint 0g.ai uses server-side).
 * The production build is re-run daily by .github/workflows/daily-redeploy.yml,
 * so the figures are at most about a day old.
 */

const CHAINSCAN_HOME = 'https://chainscan.0g.ai/v1/homeDashboard';
const FETCH_TIMEOUT_MS = 5000;

// Last known good values, updated when the fetch succeeds in a local build.
const FALLBACK = {
  accounts: 5571152,
  transactions: 35841433,
  fetchedAt: '2026-10-07',
};

// Not derivable from any public endpoint; maintained by hand.
const PARTNERS = 350;

module.exports = function liveStatsPlugin() {
  return {
    name: 'live-stats-plugin',

    async loadContent() {
      try {
        const res = await fetch(CHAINSCAN_HOME, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const r = json && json.result ? json.result : {};
        const accounts = Number(r.addressCount);
        const transactions = Number(r.transactionCount);
        if (!(accounts > 0) || !(transactions > 0)) throw new Error('unexpected payload');
        console.log(`[live-stats] accounts=${accounts} transactions=${transactions}`);
        return { accounts, transactions, fetchedAt: new Date().toISOString().slice(0, 10), live: true };
      } catch (err) {
        console.warn(`[live-stats] using fallback (${err.message})`);
        return { ...FALLBACK, live: false };
      }
    },

    contentLoaded({ content, actions }) {
      actions.setGlobalData({ ...content, partners: PARTNERS });
    },
  };
};
