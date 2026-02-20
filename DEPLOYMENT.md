# Deployment Guide — dhammarato-site

## Overview

This is an **Astro static site** deployed to **Cloudflare Workers** (not Cloudflare Pages).
The GitHub repo (`musoniusr/dhammarato-site`) is connected to Cloudflare Workers via git integration.
Every push to `master` triggers an automatic build and deployment.

---

## How It Works

1. Push to `master` on GitHub
2. Cloudflare Workers CI pulls the code
3. Runs the build command: `npm run build` → outputs static files to `dist/`
4. Runs the deploy command: `npx wrangler deploy` → deploys the Worker with static assets

---

## Critical Configuration

### wrangler.jsonc
```json
{
  "name": "dhammarato-site",
  "compatibility_date": "2026-02-14",
  "assets": {
    "directory": "./dist"
  }
}
```

**Important:**
- Use `assets.directory` — NOT `pages_build_output_dir` (that's for Pages projects, not Workers)
- Do NOT add both fields — they conflict and cause build errors

### Cloudflare Dashboard Settings
Location: `Workers & Pages → dhammarato-site → Settings → Builds & Deployments`

| Field | Value |
|-------|-------|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Version command | `npx wrangler versions upload` |
| Root directory | `/` |
| Production branch | `master` |

**Deploy command must be exactly:** `npx wrangler deploy`
- NOT `npx wrangler pages deploy dist` (that's for Pages projects)
- NOT `npx wranger deploy` (typo — missing the 'l')

### API Token
- Name: `dhammarato-site build token`
- Required permission: **Workers Scripts: Edit** (under Account permissions)
- Found at: Cloudflare Dashboard → Profile icon → My Profile → API Tokens

---

## Common Mistakes (and What Breaks)

| Mistake | Error |
|---------|-------|
| `pages_build_output_dir` + `assets` in wrangler.jsonc | "Configuration file for Pages projects does not support 'assets'" |
| Deploy command: `npx wrangler pages deploy dist` | "Project not found [code: 8000007]" — wrong command for Workers |
| Deploy command: `npx wranger deploy` | npm 404 — typo, package doesn't exist |
| API token with only Pages:Edit permission | Authentication/project not found errors |
| `pages_build_output_dir` alone (no `assets`) | Builds succeed but nothing deploys |

---

## Local Development

```bash
npm run dev        # Start dev server at http://localhost:4321
npm run build      # Build static site to dist/
```

Do NOT run `npm run deploy` locally unless you intend to deploy from your machine.
The site deploys automatically via Cloudflare on every push to master.

---

## Project Structure

- `src/content/blog/` — Markdown/MDX blog posts (transcripts)
- `dist/` — Build output (generated, not committed)
- `wrangler.jsonc` — Cloudflare Workers config
- `astro.config.mjs` — Astro config (site: https://dhammarato.com)
