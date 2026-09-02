# AGENTS.md

Guidance for AI coding agents working in this repository. `CLAUDE.md` imports this file so any agent following the [AGENTS.md convention](https://agents.md) or Claude Code reads the same instructions — **edit this file when updating shared guidance, and only put agent-specific overrides in the agent's own file (e.g. `CLAUDE.md`)**.

## What this is

Docusaurus 3 site published at https://docs.0g.ai. Content lives in `docs/`; site code, plugins, and styling live in `src/`.

## Commands

Node 24 (`.nvmrc`) and pnpm 11, **pinned via the `packageManager` field in `package.json`**. README still says `yarn`, but the committed lockfile is `pnpm-lock.yaml` — always use pnpm. Run `nvm use` (picks up `.nvmrc`) and `corepack enable` so the pinned pnpm activates automatically; CI reads the same `packageManager` pin via `pnpm/action-setup` (the workflow deliberately sets **no** `version:`, or it errors with `ERR_PNPM_BAD_PM_VERSION`).

- `pnpm install --frozen-lockfile` — install (matches CI)
- `pnpm start` — dev server with live reload
- `pnpm build` — production build into `build/`; **fails on broken internal links** (`onBrokenLinks: 'throw'`)
- `pnpm serve` — serve the built `build/` dir
- `pnpm typecheck` / `npx tsc --noEmit` — TypeScript check (CI runs this)
- `pnpm clear` — clear Docusaurus cache when builds get weird

No test suite. CI validates by: build, broken-link check (see below), a check that every link in the built `llms.txt` resolves, a retired-phrase grep (positioning language on the marketing kill list fails the build; the list is hard-coded in `ci.yml` until a shared brand canon file exists), and cspell.

### pnpm 10+ gotchas (`pnpm-workspace.yaml`)

pnpm 10+ tightened two defaults that abort installs on this repo. Both are intentionally relaxed in `pnpm-workspace.yaml` — **don't delete that file or those keys** or `pnpm install`/`pnpm start` will break again:

- `allowBuilds: { core-js: false, core-js-pure: false }` — these packages' only build step is a postinstall donation banner; without this, installs abort with `ERR_PNPM_IGNORED_BUILDS`. (pnpm regenerates an `allowBuilds:` placeholder with `"set this to true or false"` values when it hits this — fill in `false`, don't leave the placeholder.)
- `blockExoticSubdeps: false` — `@lottielab/lottie-player` resolves `lottie-web` via a git URL, which pnpm 11 blocks by default.

### Reproducing the CI link check locally

CI builds then serves the output with Vercel routing emulated (`cleanUrls` + `redirects` from `vercel.json`) and runs `broken-link-checker` against `http://localhost:3000`. A plain `pnpm serve` will *not* match production routing — if you're debugging a link-check failure, replicate the workflow from `.github/workflows/ci.yml`:

```
jq 'del(.["$schema"]) | .headers |= map(select(.has == null))' vercel.json > /tmp/serve.json
npx serve build -p 3000 -c /tmp/serve.json
npx blc http://localhost:3000 --recursive --exclude-external
```

`serve` rejects both the `$schema` field and the `has` header directive (used to host-scope the `staging.docs.0g.ai` noindex rule), so the `jq` filter strips both. Vercel still applies `has`-scoped headers at the edge in production — only the local serve step skips them.

### Spell check

`cspell` runs in CI against `**/*.{md,mdx}` using `.cspell.json`. New domain terms (chains, SDKs, contract names) usually need to be added to the `words` array there — that file is the canonical project dictionary.

## Architecture

### Routing

`routeBasePath: '/'` in `docusaurus.config.ts` — docs are served at the site root, **not** under `/docs`. A doc at `docs/concepts/chain.md` becomes `/concepts/chain`. Keep this in mind when writing cross-links: links from `docs/` should use site-absolute paths like `/concepts/chain`, not `/docs/concepts/chain`.

`trailingSlash: false` + Vercel `cleanUrls: true` — never link with a trailing slash.

### Sidebar is hand-curated

`sidebars.ts` is not auto-generated. When you add, move, or rename a doc you must update the sidebar entries to match. Items reference doc **IDs** (the `id` in frontmatter, falling back to the file path without extension), not URL slugs. A doc not listed in `sidebars.ts` will exist on disk but have no nav entry.

Frontmatter convention used across the site (see `CONTRIBUTING.md`):

```yaml
---
id: unique-identifier
title: Page Title
sidebar_position: 1
slug: /custom-url-path
description: Brief description for SEO
keywords: [keyword1, keyword2]
---
```

### Custom plugins (`src/plugins/`)

- `llms-txt-plugin.js` — the AI-facing outputs. It wraps `docusaurus-plugin-llms` (so ordering is guaranteed; do not register that plugin separately) which writes `llms-full.txt` and a cleaned markdown twin of every page at `<route>.md` (imports and JSX stripped, image URLs made absolute), then generates `llms.txt` from the docs sidebar tree (sections mirror `sidebars.ts`, every link points at the `.md` twin, the landing page and `ai-context` are listed first, pages outside any sidebar go under "Other pages"), inserts a `Source:` line under each page heading in `llms-full.txt`, and injects `<link rel="alternate" type="text/markdown">` plus `<link rel="describedby" href="/llms.txt">` into every built page. The one-line site description used in all of these is the `SITE_ONE_LINER` constant in `docusaurus.config.ts`; change it there only. CI curls every link in the built `llms.txt` (the HTML link crawler never opens it). The `.md` files exist only in the production build, not on the dev server.
- `security-headers-plugin.js` — sets CSP, X-Frame-Options, HSTS, etc. on the dev server. Production headers are set in `vercel.json`'s `headers` array **only** — Vercel does not read `_headers` files (that's a Netlify/Cloudflare Pages convention; a stale `static/_headers` used to sit here shipping nothing, and was removed). When a new page or component loads a third-party resource, the CSP in `vercel.json` (and the dev plugin, for parity) must be extended or the resource will be silently blocked in production.

### Wallet buttons (`src/components/`)

`MetaMaskButton` and `OKXButton` render the "Add 0G network" buttons on the testnet/mainnet docs pages. They are **deliberately dependency-free** (no wagmi/viem/MetaMask SDK) — appropriate for a docs site whose only wallet feature is a one-click add-network. Keep them that way unless mobile UX becomes a priority, at which point the MetaMask Connect SDK (proper deeplinking/session management) is the upgrade trigger — not wagmi.

Shared, wallet-agnostic logic (chain-id formatting, nested-error-code unwrapping, mobile + in-app-webview detection) lives in `src/components/walletUtils.ts` — one source of truth for both buttons, so e.g. the social-webview list can't drift. Invariants worth preserving (each fixes a real, audited failure mode — don't "simplify" them away):

- **MetaMaskButton** resolves the genuine MetaMask provider via **EIP-6963** (`rdns: io.metamask`), not raw `window.ethereum` — other wallets (OKX, Brave, Coinbase) overwrite it and set `isMetaMask = true` to impersonate. Legacy `window.ethereum.providers[]` / `isMetaMask` are fallbacks only, with impersonators excluded. **OKXButton** needs none of this — it targets the namespaced `window.okxwallet`, so there's no `window.ethereum` collision to disambiguate.
- Both follow MetaMask's official switch-then-add-on-`4902` pattern and handle the documented error codes: `4902` (incl. the **nested mobile shape** `error.data.originalError.code`, plus a post-switch `eth_chainId` re-check because mobile can resolve a switch without switching), `4001` (user rejected), `-32002` (request pending). Feedback is an inline `aria-live` region with an in-flight (`disabled`/`aria-busy`) guard — not `alert()`/`console.log`.
- Mobile (no injected provider) falls back to a deep link into the wallet's in-app browser — `https://link.metamask.io/dapp/<url>` for MetaMask, OKX's `okx://wallet/dapp/url` universal link for OKX. Detected social in-app webviews (where universal-link handoff is unreliable) instead show "open in your default browser" guidance.

### Math and search

- `remarkMath` + `rehypeKatex` are wired into the docs preset. Use `$...$` for inline, `$$...$$` for blocks. The KaTeX stylesheet is loaded via CDN in `stylesheets`.
- Search is `@easyops-cn/docusaurus-search-local` (client-side, no external service). Rebuild required for new content to appear in search.

### The AI context page

`docs/ai-context.md` is a special page consolidating network configs, contract addresses, SDK package names, and endpoints for AI coding assistants. It's monitored by `.github/workflows/ai-context-review.yml`, which runs every 3 days and opens an issue if npm versions, GitHub releases, or endpoint health for the referenced resources change. **When updating SDK names, RPC URLs, contract addresses, or chain IDs anywhere in the docs, update `docs/ai-context.md` too** — it's the single source AI assistants are pointed at.

### Redirects

URL changes that would break inbound links go in `vercel.json`'s `redirects` array. The CI link checker runs against the locally-served build with those redirects applied, so a redirect added there *will* satisfy the check for the old path.

### Deployments and environments

Hosted on Vercel via the native GitHub integration (no GitHub Actions deploy workflow).

- `main` → production at `https://docs.0g.ai`.
- **`VERCEL_DEEP_CLONE=true` must be set in the Vercel project's environment variables.** Vercel clones with `--depth=10` by default; the visible "Last updated" dates (`showLastUpdateTime`) and the sitemap `<lastmod>` values come from `git log`, so without a full clone most pages would carry the date of the shallow boundary commit instead of their real last change. Search engines ignore `lastmod` they cannot verify, so a shallow clone silently defeats the freshness signals.
- `staging` → long-lived staging at `https://staging.docs.0g.ai`. A QA / preview environment, **not** a release source — see workflow below.
- Every PR / non-default branch → an ephemeral preview URL (`*.vercel.app`), auto-`noindex`ed by Vercel.
- After every successful production deploy, `.github/workflows/indexnow.yml` (triggered by Vercel's `deployment_status` for the `Production – 0g-doc` environment) submits the live sitemap to IndexNow so Bing and the other IndexNow engines refresh sooner. The key is public by design and lives in `static/<key>.txt`; keep the filename and the `KEY` env in the workflow in sync if it is ever rotated.
- `context7.json` at the repo root tells Context7 to index `docs/` from this repo (the repo-backed entry should outrank the stale website scrape once the library is claimed on context7.com). `vercel.json` also sends `Link: </llms.txt>; rel="describedby"` on every page.

Vercel Authentication (deployment protection) is **disabled**, so staging and preview URLs are publicly reachable without a login — you can `curl` them directly to verify changes. They're kept out of search by `noindex` (staging via the `vercel.json` host rule, previews via Vercel's automatic header), not by an auth wall.

#### Branching workflow

`main` is the source of truth. Open PRs **from a feature branch into `main`** — one feature per PR, so each gets a scoped, reviewable diff. Do **not** open `staging → main` PRs: `staging` is long-lived and accumulates unrelated work, so promoting from it bundles half-finished changes and produces noisy diffs.

`staging` is where you integrate and eyeball changes (and gather stakeholder sign-off) before merging the feature branch to `main`. To preview, push your branch onto `staging` (`git push origin <branch>:staging`). After a feature lands on `main`, re-sync `staging` to `main` so it doesn't drift — `main` is truth; `staging` mirrors `main` plus whatever is currently being previewed.

Two environment-aware bits of config worth knowing about:

- **Analytics (gtag, Clarity)** are gated on `process.env.VERCEL_ENV === 'production'` in `docusaurus.config.ts` (via an `isProd` constant). They only ship to the live site — not to staging, previews, or local builds. **If you add another third-party tracker, follow the same pattern** so it doesn't pollute prod metrics from non-prod deploys.
- **`staging.docs.0g.ai` is host-scoped to `X-Robots-Tag: noindex, nofollow`** via the first entry in `vercel.json`'s `headers` array. Don't remove that rule unless you genuinely want staging indexed.

The schema.org JSON-LD tags in `headTags` stay on every environment — they're SEO metadata, not user tracking, and noindex already prevents staging from being indexed.

## Conventions

- Commit prefixes used in this repo: `fix:`, `docs:`, `style:`, `chore(ci):`, `chore(docs):`. Match what `git log` shows for nearby work.
- `CODEOWNERS` routes review automatically based on path — no need to manually request reviewers.
- Don't introduce a `package-lock.json` or `yarn.lock`; the lockfile is `pnpm-lock.yaml`.
