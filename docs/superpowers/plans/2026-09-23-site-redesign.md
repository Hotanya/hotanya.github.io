# Site Redesign (Astro "Field notes") Implementation Plan

> **For agentic workers:** executed natively in-session (user asked to start building immediately). Steps use checkbox syntax.
>
> **Execution note (2026-09-24):** Tasks 1–5 and the redirects/cleanup in Task 6 were built natively in this session. CI workflow, Dependabot, README/docs and a final review were handed to subagents. Where the build deviated from this plan (Astro 7, two YAML files instead of data collections, `shiki-code-frame` transformer instead of `rehype-code-bar`), the spec has been updated to match.

**Goal:** Replace the Jekyll/minimal-mistakes site with a static Astro site matching the approved mockups.

**Architecture:** Astro static output. Posts are a content collection (folder per post, co-located images). Site and portfolio data live in two YAML files validated with Zod in `src/lib/data.ts`. Styling is plain CSS with custom properties, with no framework. Remark/rehype plugins handle Obsidian callouts, wikilink images and figures. Pagefind runs after the build.

**Tech Stack:** Astro 7 (remark/rehype via `@astrojs/markdown-remark`'s `unified()` processor), @astrojs/rss, @astrojs/sitemap, Shiki (built in), Pagefind, @fontsource fonts, Node 22+.

**Spec:** `docs/superpowers/specs/2026-09-23-site-redesign-design.md`

## Global Constraints
- Post URLs stay `/blog/<old-slug>/`. `/posts/`, `/portfolio/` and `/feed.xml` are kept.
- `public/.well-known/appspecific/com.tesla.3p.public-key.pem` is byte-identical to the current file.
- No Google Analytics and no Cookiebot. No external requests except Cloudflare's auto-injected beacon.
- No employer name on the home page.
- Oxblood is never used as a large fill.

## Review Focus
1. Posts with no `image` and no `cover` still render a cover (title fallback).
2. Fewer than five posts: the index shows what exists, with no empty columns crashing.
3. Theme toggle with localStorage blocked: the page still renders and follows the system.
4. Obsidian `![[file.png|alt]]` with spaces in the file name resolves correctly.
5. Wide code lines scroll inside the block; the page never scrolls horizontally at 360px.

---

### Task 1: Scaffold
- [x] `package.json`, `astro.config.mjs`, `tsconfig.json`, `.nvmrc` (no `src/env.d.ts` needed)
- [x] Move `.well-known` to `public/`, bio photo to `src/assets/`
- [x] `npm install` and `npx astro build` succeed on an empty page

### Task 2: Styles and layout shell
- [x] `src/styles/global.css` (tokens, header, footer, contact), plus `post.css` (prose, code) and `portfolio.css`
- [x] `src/layouts/Base.astro` (head, SEO/OG, JSON-LD, no-flash theme script, search modal)
- [x] `src/components/Header.astro` (includes the theme toggle), `Footer.astro`, `Contact.astro`, `FeatureMedia.astro`, `Search.astro`

### Task 3: Content model and migration
- [x] `src/content.config.ts` (posts collection with Zod schema)
- [x] Six posts migrated into `src/content/posts/<date-slug>/index.md` with images, slug preserved
- [x] `src/data/site.yaml` and `src/data/portfolio.yaml`, validated in `src/lib/data.ts`

### Task 4: Markdown pipeline
- [x] `src/plugins/remark-obsidian-images.mjs`, `remark-callouts.mjs`, `rehype-figures.mjs`, `shiki-code-frame.mjs` (Shiki transformer, replaces `rehype-code-bar`)
- [x] Shiki custom themes (light/dark) via CSS variables (`src/lib/shiki-themes.mjs`)

### Task 5: Pages
- [x] `index.astro` (hero, feature, index, talks strip, contact)
- [x] `posts/index.astro` (year groups, type filters)
- [x] `blog/[slug].astro` (head, facts, rail, TOC, timeline, end matter)
- [x] `portfolio.astro`, `404.astro`, `feed.xml.ts`

### Task 6: Search, redirects, cleanup, verification
- [x] Pagefind post-build and search modal
- [x] `public/_redirects`
- [x] Remove Jekyll files
- [x] Update dependabot; add a CI workflow (subagent)

- [x] Build; check every old URL exists in `dist/`; `.pem` hash matches; visual check
      (build green: 10 pages, Pagefind 6; all 6 `/blog/<slug>/` + `/posts/`, `/portfolio/`,
      `/feed.xml`, `/404`; `.pem` sha256 `398f94a3…` unchanged; independent review's confirmed
      findings fixed — see §Post-review fixes below)

---

## Post-review fixes (2026-09-24)

An independent review of the working tree found these; all confirmed ones are fixed and the build
re-verified.

**Fixed**
- **Type filter did nothing** — `.row`/`.yr` are `display: grid`, which beat the UA `[hidden]`
  rule, so `el.hidden` never hid anything. Added `[hidden] { display: none !important }` to
  `global.css`.
- **8 images lost their figure/caption** — the migrated Markdown had an image line butted against
  the next text line, so Markdown merged them into one paragraph and `rehype-figures` skipped it.
  Added the missing blank line after each (GraphQL ×6, Vite ×2). GraphQL now renders 12 figures
  (was 6), Vite 3 (was 1).
- **Lead-image de-dup false positives** — `blog/[slug].astro` hid the lead figure whenever the body
  contained `"<name>."` anywhere (prose included). Now matches the full `"<name>.<ext>"`.
- **Enter closed the search dialog** — `<form method="dialog">` submitted on Enter. Added a
  `submit` handler that calls `preventDefault()`.
- **`--ink3` failed WCAG AA** on small text. Light `#75737e → #6b6974`, dark `#807e89 → #8c8a95`.
- **404 Contact link + canonical** — Header now links Contact to `/#contact` on every non-home
  page; 404 emits `<meta name="robots" content="noindex">`.
- **Figure caption read twice** — a framed figure's `<img>` alt duplicated its `<figcaption>`.
  `rehype-figures` now sets the framed image's `alt=""` (caption carries the description).
- **Old inline videos 404'd** — added `301`s from `/images/IDOR.mp4` and `/images/injection.mp4`
  to their `/media/` paths.

**Left as-is (documented, no current content triggers them)**
- `remark-callouts` truncates a callout title that contains inline formatting — no post uses
  `> [!note]` callouts.
- `remark-obsidian-images` uses the file name as the caption for an aliasless `![[file]]` embed —
  no post ships an aliasless embed; the author's Obsidian embeds carry `|alt` text.
- Feed guids gained trailing slashes vs the old Atom `<id>`, so subscribers may see each post as
  new once — a one-time reflash, acceptable.
