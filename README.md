# CSV Visualizer — Local Data Explorer

Drop in a hard-to-read CSV, get back a dataset you can understand and analyze.
All parsing happens **locally in your browser** — nothing is ever uploaded.

> [!NOTE]
> `README_AGENT.md` is the developer build spec. This file is the user guide.

## Features

- **Import** — file picker or drag & drop, UTF-8, quoted fields, friendly error messages
- **Table** — sticky header, type-aware sorting, global search, pagination (handles 100k+ rows)
- **Columns** — rename display names, change data types, descriptions, units, decimal places, widths, hide (never deletes), reorder
- **Filters** — type-aware operators with AND / OR, live updates everywhere
- **Statistics** — count / mean / median / min / max / sum / missing / unique + dataset quality, always based on the current view
- **Visualization** — bar / line / scatter / pie (ECharts, lazy-loaded) with smart chart suggestions
- **Export** — CSV honoring display names, column order, hidden columns, and active filters
- **Undo / Redo** — rename, type, hide, reorder, sort, filter (`Ctrl+Z` / `Ctrl+Shift+Z`)
- **Polish** — light / dark / system theme, keyboard navigation, responsive layout, status bar

## Quick start

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the printed URL (usually http://localhost:5173), then drop in a CSV.
A sample dataset is included: `taiwan_bankruptcy_572.csv` (Taiwanese Bankruptcy Prediction, UCI id 572, 6819 rows × 96 cols).

## Scripts

| Command        | What it does                              |
| -------------- | ----------------------------------------- |
| `npm run dev`  | Start dev server                          |
| `npm run build`| Production build to `dist/`               |
| `npm run preview` | Serve the production build locally     |
| `npm test`     | Run unit tests (vitest, 53 tests)         |
| `npm run check`| Type check (svelte-check + tsc)           |

## Tech

Svelte 5 + Vite + TypeScript + Tailwind CSS 4, PapaParse for CSV, ECharts for charts (code-split, loaded on demand).

## Deploy to Cloudflare Pages

Static site only — no server or SPA fallback rules needed (single `index.html`).

### Option A — Dashboard (recommended)

1. [Cloudflare dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** → select `madeinwen/CSV.madeinwen.com`.
2. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - (Environment variables → add `NODE_VERSION = 20`)
3. **Save and Deploy**. You get `https://<project>.pages.dev`.
4. Custom domain `CSV.madeinwen.com`: project → **Custom domains** → **Set up a custom domain** → enter `CSV.madeinwen.com` → Cloudflare adds the DNS record automatically (domain must be on Cloudflare).

### Option B — Wrangler CLI

```bash
npm install -D wrangler
npm run build
npx wrangler pages project create csv-visualizer   # first time only
npx wrangler pages deploy dist --project-name=csv-visualizer
```

Then bind the custom domain with:

```bash
npx wrangler pages domain add CSV.madeinwen.com --project-name=csv-visualizer
```

### Redeploys

Pushes to `master` auto-deploy in production (Option A). Preview deployments are created for other branches / pull requests automatically.

## Notes for beta testers

- Very large files (100k+ rows): the table paginates, but statistics/duplicate-scan sample the first 20,000 rows to stay responsive.
- Scatter plots sample the first 2,000 points; bar charts show the top 20 groups.
- Found a bug? Please report: the file name, the action you took, and what you expected.
