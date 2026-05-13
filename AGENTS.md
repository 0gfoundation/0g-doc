# AGENTS.md

Guidance for AI coding agents working in this repository. `CLAUDE.md` imports this file so any agent following the [AGENTS.md convention](https://agents.md) or Claude Code reads the same instructions — **edit this file when updating shared guidance, and only put agent-specific overrides in the agent's own file (e.g. `CLAUDE.md`)**.

## What this is

Docusaurus 3 site published at https://docs.0g.ai. Content lives in `docs/`; site code, plugins, and styling live in `src/`.

## Commands

Node 20.11.0 (`.nvmrc`). README uses `yarn`, but the committed lockfile is `pnpm-lock.yaml` and CI runs pnpm 9 — prefer pnpm to keep the lockfile clean.

- `pnpm install --frozen-lockfile` — install (matches CI)
- `pnpm start` — dev server with live reload
- `pnpm build` — production build into `build/`; **fails on broken internal links** (`onBrokenLinks: 'throw'`)
- `pnpm serve` — serve the built `build/` dir
- `pnpm typecheck` / `npx tsc --noEmit` — TypeScript check (CI runs this)
- `pnpm clear` — clear Docusaurus cache when builds get weird

No test suite. CI validates by: build, broken-link check (see below), and cspell.

### Reproducing the CI link check locally

CI builds then serves the output with Vercel routing emulated (`cleanUrls` + `redirects` from `vercel.json`) and runs `broken-link-checker` against `http://localhost:3000`. A plain `pnpm serve` will *not* match production routing — if you're debugging a link-check failure, replicate the workflow from `.github/workflows/ci.yml`:

```
jq 'del(.["$schema"])' vercel.json > /tmp/serve.json
npx serve build -p 3000 -c /tmp/serve.json
npx blc http://localhost:3000 --recursive --exclude-external
```

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

- `markdown-endpoint-plugin.js` — copies raw `.md`/`.mdx` files into the build output so `docs.0g.ai/concepts/compute.md` returns raw markdown. Used by LLM tooling. Also installs dev-server middleware so the same routes work under `pnpm start`.
- `security-headers-plugin.js` — sets CSP, X-Frame-Options, HSTS, etc. on the dev server. Production headers are set in `static/_headers` (Vercel) and `vercel.json`.
- `docusaurus-plugin-llms` — generates `llms.txt` and `llms-full.txt` at the site root from the docs corpus.

### Math and search

- `remarkMath` + `rehypeKatex` are wired into the docs preset. Use `$...$` for inline, `$$...$$` for blocks. The KaTeX stylesheet is loaded via CDN in `stylesheets`.
- Search is `@easyops-cn/docusaurus-search-local` (client-side, no external service). Rebuild required for new content to appear in search.

### The AI context page

`docs/ai-context.md` is a special page consolidating network configs, contract addresses, SDK package names, and endpoints for AI coding assistants. It's monitored by `.github/workflows/ai-context-review.yml`, which runs every 3 days and opens an issue if npm versions, GitHub releases, or endpoint health for the referenced resources change. **When updating SDK names, RPC URLs, contract addresses, or chain IDs anywhere in the docs, update `docs/ai-context.md` too** — it's the single source AI assistants are pointed at.

### Redirects

URL changes that would break inbound links go in `vercel.json`'s `redirects` array. The CI link checker runs against the locally-served build with those redirects applied, so a redirect added there *will* satisfy the check for the old path.

## Conventions

- Commit prefixes used in this repo: `fix:`, `docs:`, `style:`, `chore(ci):`, `chore(docs):`. Match what `git log` shows for nearby work.
- `CODEOWNERS` routes review automatically based on path — no need to manually request reviewers.
- Don't introduce a `package-lock.json` or `yarn.lock`; the lockfile is `pnpm-lock.yaml`.
