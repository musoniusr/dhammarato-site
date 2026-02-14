# Dhammarato Dhamma Transcripts Site

A clean, simple Astro site for hosting Dhamma talk transcripts, optimized for Cloudflare Pages deployment.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

## Adding New Transcripts

### Method 1: Automated Processing

1. Place transcript file in `incoming-transcripts/` folder
2. Format:
```markdown
---
title: "Your Talk Title"
date: 2024-12-29
youtube: https://youtube.com/watch?v=VIDEO_ID
---

Transcript content here...
```

3. Run processing script:
```bash
npm run process-transcript
```

### Method 2: Manual Addition

Add markdown files directly to `src/content/blog/` with this format:
```markdown
---
title: "Talk Title"
pubDate: 2024-12-29
youtube: "VIDEO_ID"
description: "Dhamma talk transcript"
---

Transcript content...
```

## Deployment to Cloudflare Pages

### Initial Setup
1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Create Cloudflare Pages project:
```bash
wrangler pages project create dhammarato-site
```

### Deploy
```bash
npm run deploy
```

## File Structure

```
dhammarato-site/
├── src/
│   └── content/
│       └── blog/          # All transcript markdown files
├── incoming-transcripts/   # Drop new transcripts here
│   └── processed/         # Archived after processing
├── process-new-transcript.js  # Automation script
└── dist/                  # Build output
```

## Simplified Frontmatter

All transcripts use minimal frontmatter:
- `title` (required): Talk title
- `pubDate` (required): Date in YYYY-MM-DD format
- `youtube` (optional): YouTube video ID
- `description` (optional): Defaults to "Dhamma talk transcript"

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run process-transcript` - Process new transcripts
- `npm run deploy` - Build and deploy to Cloudflare Pages