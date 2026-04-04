# dhammarato-site — Project History & Technical Decisions

This document records what has been built, why decisions were made, and what problems
were solved. It is not served on the live site. It lives in the repo so any volunteer
or contributor can understand the full context of the project.

---

## What This Site Is

**https://dhammarato.com** is a static website that publishes transcripts of Dhamma
talks by Dhammarato. Each transcript is a Markdown file containing:

- YAML frontmatter (title, date, tags, YouTube video ID, AssemblyAI transcript ID)
- An embedded YouTube video
- The full transcript text (generated via AssemblyAI)
- A summary section
- A "Connect with Dhammarato and Sangha Friends" section

As of April 2026 the site has ~1,650 transcripts spanning 2014–2026.

---

## Technology Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Astro (static) | Zero JavaScript by default, fast static output, excellent Markdown/content support |
| Hosting | Cloudflare Workers | Free tier, global CDN, git-integrated auto-deploy |
| Search | Pagefind | Runs at build time, no server needed, handles 1,650+ pages efficiently |
| Transcription | AssemblyAI | Automated speech-to-text for YouTube videos |
| Tracking | processed_videos.csv (separate repo) | Tracks which videos have been transcribed |

---

## Repository Structure

```
dhammarato-site/           ← this repo (musoniusr/dhammarato-site)
  src/
    content/blog/          ← all transcript .md files (~1,650 files)
    pages/
      blog/index.astro     ← Transcripts listing page with Pagefind search
      blog/[...slug].astro ← Individual transcript pages
      index.astro          ← Home page
      glossary.astro       ← Glossary page
      about.astro          ← About page
    layouts/
      BlogPost.astro        ← Layout for all transcript pages
    components/
      Header.astro          ← Site navigation
  public/                  ← Static assets (fonts, favicon)
  wrangler.jsonc           ← Cloudflare Workers config
  astro.config.mjs         ← Astro config (integrations, site URL)
  package.json             ← Node dependencies and build scripts
  CLAUDE.md                ← Instructions for Claude AI assistant
  DEPLOYMENT.md            ← Deployment reference (critical config)
  HISTORY.md               ← This file

Dhammarato-Transcription-Scripts/  ← separate repo (musoniusr/Dhammarato-Transcription-Scripts)
  processed_videos.csv     ← Master record of all transcribed videos
  dhammarato_transcription_pipeline.py  ← AssemblyAI transcription pipeline
  list_of_videos.txt       ← Full YouTube video list
```

---

## Full History of Changes

### February 13, 2026 — Initial Build

**What:** Site created from scratch as an Astro project. Initial batch of transcripts
imported. Basic pages built: Home, Transcripts listing, About, Glossary.

**Decisions made:**
- **Astro over WordPress/Ghost/etc.** — No database, no server costs, pure static files.
  Each transcript is just a Markdown file, easy to add by volunteers.
- **Cloudflare Workers over Netlify/Vercel** — Free tier is generous, no function
  invocation limits for a static site, global CDN performance.
- **Markdown files over a database** — Transcripts can be edited in any text editor,
  version-controlled in git, and reviewed via pull requests.

**Also done Feb 13–14:**
- Added hamburger menu and mobile responsive navigation
- Added Glossary page
- Fixed broken YAML frontmatter in several posts (quotes in titles caused parse errors)
- Replaced default Astro favicon with the Buddha joy icon
- Updated all old posts that had Skype sangha info with the current Connect block
- Fixed 31 posts that had wrong year (2020 instead of 2025) due to date parsing errors
- Fixed misdated post (2028 → 2024) for Sangha UK #236
- Replaced Open Graph preview image with buddha-joy image
- Added 84 new transcripts

---

### February 13–19, 2026 — Cloudflare Deployment Struggles

**What:** Getting the site to actually deploy on Cloudflare was non-trivial.
Multiple failed attempts before the correct configuration was found.

**The problem:** This is a **Cloudflare Workers** project, not a **Cloudflare Pages**
project. The two are different products with different configuration. Much of the
documentation online is for Pages, not Workers, which caused repeated confusion.

**Mistakes made and fixed:**
- `wrangler.jsonc` initially used `pages_build_output_dir` (Pages config) → broken
- Deploy command set to `npx wrangler pages deploy dist` (Pages command) → broken
- API token had only Pages:Edit permission, needed Workers Scripts:Edit → broken
- Having both `assets` and `pages_build_output_dir` in wrangler.jsonc → conflict error

**Correct configuration (documented in DEPLOYMENT.md):**
- `wrangler.jsonc` uses `assets: { directory: "./dist" }` only
- Deploy command: `npx wrangler deploy` (not `pages deploy`)
- API token permission: Workers Scripts:Edit

---

### February 15–17, 2026 — Large Transcript Batches

**What:** Bulk addition of transcripts from 2022–2023 era (400+ posts across several commits).

**Note:** A post dated Feb 14 caused repeated build failures and was temporarily removed
and re-added several times while diagnosing the issue. Eventually resolved.

---

### February 19–21, 2026 — More Bulk Transcripts + Deployment Docs

**What:**
- Added 119 more transcript posts (Feb 2021 – Nov 2022)
- Added deployment documentation (DEPLOYMENT.md) and Claude AI instructions (CLAUDE.md)
- Added another batch of ~295 transcripts (2020–2022 era) by Christopher

**Why CLAUDE.md:** The site is managed with the help of Claude AI. CLAUDE.md gives
Claude the critical project context (Workers vs Pages distinction, correct deploy
commands) so it doesn't repeat past mistakes.

---

### February 24–28, 2026 — Volunteer Transcription Batches (Mikey & Jonas)

**What:** Two volunteers added large batches of older transcripts:
- Mikey (Feb 24): 168 files, 2020 era content
- Jonas (Feb 28): 170 files, 2019–2020 era content

**Note:** These additions were made directly to GitHub by the volunteers. The
`processed_videos.csv` in the Transcription Scripts repo was not always updated
simultaneously, causing sync gaps that needed to be resolved later.

---

### April 4, 2026 — OOM Build Fix + Search Overhaul

This session addressed two significant problems that had accumulated as the site grew.

#### Problem 1: Cloudflare Build Failing (Out of Memory)

**What happened:** After the large volunteer batches pushed the site to 1,648+ posts,
the Cloudflare Workers build started crashing with a Node.js out-of-memory error:

```
v8::internal::Runtime_RegExpExecMultiple
...
Aborted (core dumped)
Failed: error occurred while running build command
```

**Why:** The default Node.js heap size (~1.5GB) was insufficient for Astro to compile
1,648+ pages. The build was running out of memory during markdown processing (regex
operations on large content).

**Fix:** Added `NODE_OPTIONS=--max-old-space-size=4096` to the build script in
`package.json`, giving Node.js up to 4GB of heap for the build:

```json
"build": "NODE_OPTIONS=--max-old-space-size=4096 astro build"
```

**Note:** This syntax works on Linux (Cloudflare's build environment) but not Windows.
For local builds on Windows, run: `node --max-old-space-size=4096 node_modules/astro/astro.js build`

#### Problem 2: Transcripts Page Performance

**What happened:** The `/blog` (Transcripts) page was using a client-side JavaScript
filter that worked by embedding all 1,648 posts' content into the HTML page as
`data-*` attributes:

```html
<li data-title="..." data-date="..." data-content="[500 chars of transcript text]">
```

With 1,648 posts × ~580 chars of data attributes each, this produced a **~1.5MB HTML
page** (compressed to ~400–500KB). On every keystroke the JavaScript had to iterate
all 1,648 DOM nodes to filter results. On slow devices this was noticeably sluggish.

**Fix:** Replaced with **Pagefind** — a static search library that:
1. Runs after the Astro build, indexing all 1,648 pages
2. Writes a chunked index to `dist/pagefind/` as static files
3. Loads only the relevant index chunks when a user types a query
4. Has no server component — everything is served as static files from Cloudflare

**Result:**
- `/blog` page weight dropped from ~1.5MB to ~150KB
- Search now covers the full text of all transcripts (titles, content, summaries)
- Summaries (`### Summary` section in each post) are indexed as part of the full
  transcript body — searches for terms that appear in summaries will find the post
- Pagefind indexed 1,655 pages and the search is live at dhammarato.com/blog

**Technical notes on the Pagefind implementation:**
- `astro-pagefind` npm package handles the post-build indexing automatically
- `data-pagefind-body` attribute added to the `.prose` div in `BlogPost.astro`
  tells Pagefind which part of each page to index (the transcript content, not the
  header/footer)
- `pagefind-ui.js` is loaded as a `<script src is:inline>` (it's an IIFE global,
  not an ES module — `import { PagefindUI }` will not work)
- `pagefind-ui.css` is loaded in `<head>` for the search UI styles
- The pagefind index files in `dist/pagefind/` are generated at build time and
  served as static assets — they do not need to be committed to git

#### CSV Sync (Transcription Scripts repo)

The `processed_videos.csv` in the Transcription Scripts repo was out of sync with
the site repo. 339 transcript files added by volunteers were missing from the CSV.
These were reconstructed by extracting frontmatter (video ID from image URL,
AssemblyAI transcript ID from frontmatter field) and appended to the CSV.

After Jonas pushed a simultaneous update, a deduplication pass removed 179 duplicate
and malformed rows, leaving 1,648 clean entries — one per blog file.

---

## Ongoing Workflow

### Adding New Transcripts

1. Transcribe video using the pipeline in `Dhammarato-Transcription-Scripts`
2. Add the generated `.md` file to `src/content/blog/`
3. Update `processed_videos.csv` in the Transcription Scripts repo
4. Push to `master` — Cloudflare auto-deploys

### If the Build Fails on Cloudflare

Check the Workers dashboard at:
`Cloudflare Dashboard → Workers & Pages → dhammarato-site → Deployments`

Common causes:
- **OOM**: The `NODE_OPTIONS` fix in package.json should prevent this, but if the
  site grows significantly further it may need to be increased beyond 4096
- **YAML parse error**: A post with unescaped quotes in the title. Check recent
  commits for the offending file and fix the frontmatter
- **Wrangler config error**: See DEPLOYMENT.md

### Search Indexing

Search is rebuilt automatically on every Cloudflare deploy — no manual step needed.
The Pagefind integration hooks into `astro:build:done` and indexes all pages before
the deploy completes.

---

## Known Limitations & Future Considerations

**Search result ranking:** Pagefind indexes the full transcript body with uniform
weighting. The `### Summary` section (which contains the best human-readable description
of each talk) is indexed but not given extra weight over the raw transcript. If search
quality needs improvement, a rehype plugin could be added to `astro.config.mjs` to
wrap summary content in a `data-pagefind-weight="5"` div, boosting its influence on
result ranking.

**Build time:** A full local build takes ~3 minutes. Cloudflare builds take similar
time. This will grow as more transcripts are added. Not a problem yet.

**CSV vs repo sync:** The `processed_videos.csv` and the blog files can drift out of
sync when volunteers add transcripts directly to GitHub without updating the CSV.
The discrepancy can be found and fixed using the Node.js comparison script used in
April 2026 (see git history).
