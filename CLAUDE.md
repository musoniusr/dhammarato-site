# Claude Instructions — dhammarato-site

## Read First

Before doing any deployment-related work, read `DEPLOYMENT.md` in this repo.
It covers the full setup, common mistakes, and correct configuration.

## Project Summary

- **Site:** https://dhammarato.com
- **Framework:** Astro (static site, no server adapter)
- **Deployment:** Cloudflare Workers (git-integrated, auto-deploys on push to master)
- **GitHub:** musoniusr/dhammarato-site
- **Dev server:** `npm run dev` → http://localhost:4321

## Key Facts

- This is a **Cloudflare Workers** project — NOT Cloudflare Pages
  - Dashboard URL: `/workers/services/view/dhammarato-site/`
  - Deploy command: `npx wrangler deploy`
  - wrangler.jsonc uses `assets.directory`, not `pages_build_output_dir`
- Pushing to `master` triggers automatic build and deployment
- No manual deploy needed — just push to GitHub

## Content

- Blog posts (transcripts) live in `src/content/blog/`
- New transcript files can be added and committed; they deploy automatically
- Build produces ~1019 pages as of early 2026
