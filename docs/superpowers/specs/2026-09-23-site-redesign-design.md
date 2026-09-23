# hotanya.fyi redesign: "Field notes" on Astro

**Date:** 2026-09-23
**Status:** Approved 2026-09-23. Implemented 2026-09-24; updated afterwards to describe what was built.
**Mockups:** [`2026-09-23-site-redesign/mockups/`](2026-09-23-site-redesign/mockups/). Open `home.html`, `post.html` and `portfolio.html` directly in a browser. They are the visual source of truth for this spec.

## 1. Goal

Rebuild hotanya.fyi as a professional portfolio plus technical blog that does not look template-made or AI-generated. It should be restrained and editorial, with a security-research character. Authoring stays **write Markdown (in Obsidian), push, done**, with no CMS.

**Audience:** prospective employers, clients and conference organisers vetting Hotanya, plus security peers reading write-ups. The writing is the credibility, and the experience detail lives on the portfolio page.

**Success criteria**
- Adding a post means creating one Markdown file (plus optional images in the same folder) and pushing.
- Every existing public URL either still resolves or redirects.
- Light and dark modes both look deliberate. The site follows the system setting by default, and a toggle overrides it.
- No template artefacts: no pills, no emoji identity, no stock component shapes, and no Tailwind default palette.

## 2. Decisions made during brainstorming

| Topic | Decision |
|---|---|
| Direction | "Field notes": a blend of a research-lab structure and warm engineering detail |
| Palette | **Mist** neutral with an **oxblood** accent (tokens in §3.1) |
| Default theme | Follow system, with a manual toggle that persists |
| Homepage experience | Low-key: one muted line under the intro. All detail goes on `/portfolio/` |
| Homepage layout | **Feature + index**: one featured post, a four-column ruled index, a single-line talks strip |
| Feature media | Optional **framed image** (photo or screenshot, same treatment), otherwise a generated **text cover** |
| Photo tone | Original (no duotone or greyscale) |
| Index | Text only (no thumbnails) |
| Advisory accent | Never solid red blocks. Oxblood appears only as a 2px top rule, the CVE ID, and highlights |
| Skills (portfolio) | **Run-in heads**: an italic oxblood serif group label running into the list |
| Certs | No "held" label. Pending certs show "in progress" |
| Stack | **Astro** on Cloudflare Pages (replacing Jekyll + minimal-mistakes) |
| Analytics | **Cloudflare Web Analytics** (cookieless). Remove Google Analytics and Cookiebot |
| Search | **Pagefind** (static index, no service) |
| Contact / booking | Out of scope. Contact stays as a section with a CTA; booking comes later |

## 3. Visual system

### 3.1 Colour tokens

Defined as CSS custom properties on `:root`. Dark values apply under `@media (prefers-color-scheme: dark)` when `:root:not([data-theme="light"])`, and under `:root[data-theme="dark"]`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#efeef2` | `#17161b` | page |
| `--surface` | `#e5e3ea` | `#1f1e24` | covers, frames, callouts, hover rows |
| `--surface2` | `#dcdae3` | `#27262e` | hover on surface |
| `--rule` | `#d8d6de` | `#2e2d35` | hairlines |
| `--ink` | `#19181d` | `#e9e8ee` | primary text, strong rules |
| `--ink2` | `#4e4c56` | `#a6a4ae` | body secondary |
| `--ink3` | `#75737e` | `#807e89` | metadata (adjusted from the mockups' `#817f8a` / `#75737e` for contrast) |
| `--acc` | `#942c30` | `#e2848a` | oxblood accent |
| `--acc-soft` | `rgba(148,44,48,.07)` | `rgba(226,132,138,.08)` | highlight backgrounds |
| `--code-bg` | `#e7e5ec` | `#1e1d23` | code blocks, inline code |

Syntax tokens (custom Shiki theme, light / dark): keyword `#942c30`/`#e2848a`, string `#3f6b4f`/`#9cc7a4`, function `#4a4a8c`/`#a9a9ec`, property `#7a4f1f`/`#e0b27a`, comment `#8f8d98`/`#6f6d78` in italic.

**Accent rules:** oxblood is for detail, never fill. It's used for link underlines, the active nav underline, the headline `<em>`, type labels on advisories and disclosures, CVE IDs, the 2px top rule on advisory covers and frames, the reading-progress bar, the active TOC item, and callout borders. The only filled-accent element allowed is the hover state of the primary button.

### 3.2 Typography

Self-hosted via `@fontsource` packages imported in `Base.astro`. There is no Google Fonts request.
- **Newsreader 500** (roman and italic): display headings, post titles on the feature slot, post h2, talk titles, contact heading, run-in skill labels.
- **IBM Plex Sans 400/500/600**: body, UI and index titles.
- **IBM Plex Mono 400/500**: metadata only (dates, type labels, tags, section heads, code, captions).

**Scale:** hero h1 `clamp(34px, 5vw, 60px)` with line-height 1.08. Post h1 `clamp(34px, 4.6vw, 56px)`. Post body 17.5px/1.75. Base 16px/1.65.

### 3.3 Layout

- Container max width is **1320px**, with side padding `clamp(20px, 4vw, 64px)`. The user explicitly rejected narrow layouts with wide empty margins.
- Post body column is up to 720px, with the right rail (TOC and timeline) using the remaining width. Wide figures may extend into the rail gutter.
- Radii: 6–10px. No drop shadows except on framed images. No gradients.
- Every layout must work at 360px width without horizontal scroll. The mockups' breakpoints (~1040, ~860, ~760, ~700px) are the reference.

### 3.4 Theme toggle

A half-circle SVG icon button in the header. An inline `<head>` script reads `localStorage.theme` before first paint and sets `data-theme`, so there's no flash. With no stored value the site follows the system. The toggle writes `light` or `dark`. All storage access is wrapped in try/catch.

## 4. Pages

### 4.1 Home (`/`): mockup `home.html` (feature: screenshot mode, index: text only)

1. **Header:** `hr` monogram and name; nav **Writing · Talks · Portfolio · Contact**; search button; theme toggle. Below 420px the Talks and Contact links are hidden.
2. **Hero:** serif headline **"Pentester turned *AppSec Engineer*."** (accent on the `<em>`), description **"Cybersecurity, vulnerability research and homelab projects."**, and a muted byline: `Hotanya Ragtah · Senior AppSec Engineer`. No employer name on the home page; employers appear only on `/portfolio/`. There's no portfolio link here; Portfolio is in the nav. Headline, description, name and role come from `src/data/site.yaml` (`*phrase*` in the headline renders as the accent `<em>`).
3. **Featured:** `sh` label "featured" with "all writing →". The featured post is the newest post with `featured: true`, otherwise the newest post overall. It's shown as a two-column block of media (§5.3) and text (date · read time, serif title, summary, tags).
4. **Index:** the next four posts, excluding the featured one, in a four-column ruled grid. Each shows the type label (with month), title and summary. This collapses to two columns, then one.
5. **Talks strip:** one line: `TALKS` then each talk's short title with its venue and year. It scrolls horizontally on small screens.
6. **Contact block:** serif prompt, supporting line, "Get in touch" (primary, links to `contact.url`) and GitHub buttons.
7. **Footer:** © year, rss · github · linkedin.

### 4.2 Writing archive (`/posts/`)

Not mocked separately. It reuses the index row style from the home index at full width, grouped by year, with mono type filter tabs (**All · Advisories · Research · Guides · Notes**, with counts) that filter client-side without a page reload. "Advisories" includes both `advisory` and `disclosure`. Tabs with no posts are hidden, as is a year with no matching posts. Rows show the type (plus CVE ID when set), title, summary and full date. This replaces `/tags/` and `/categories/`.

### 4.3 Post (`/blog/<slug>/`): mockup `post.html`

- A thin oxblood reading-progress bar fixed at the very top.
- **Head:** breadcrumb `writing / <type>`, serif h1, lead (the `summary`), and a meta row (avatar and name, date, read time, tags).
- **Facts row** (only when advisory fields are present): a ruled horizontal `<dl>` of CVE, Advisory (GHSA), Project, Component and Status. Any missing field is omitted. CVE links to `advisory.links.cve` (default: the cve.org record) and GHSA to `advisory.links.ghsa`.
- **Framed image** at the top of the body if `image` is set, unless the body already embeds the same image file (it's usually Fig. 1). The same image is used for the feature slot and OpenGraph.
- **Body:** styled Markdown (§5.4).
- **Right rail** (sticky on ≥1040px; above the body and collapsed on smaller screens):
  - "On this page" TOC from h2/h3, with the active section highlighted.
  - **Disclosure timeline** from `timeline:` front matter, if present.
  - Copy link · LinkedIn share · Edit on GitHub (`repo` in site.yaml, `master` branch).
  - Below 1040px only the TOC shows (boxed, above the body); the timeline and share links are hidden.
- **End matter:** references list (styled when a `## References` list is present), author line with avatar and links, and older/newer post navigation. Post pages have no contact block; the header's Contact link goes to `/#contact`.

### 4.4 Portfolio (`/portfolio/`): mockup `portfolio.html`

- **Intro:** breadcrumb, serif headline, a paragraph, Get in touch (`contact.url`) and LinkedIn buttons (no CV button), and the framed bio photo captioned with name and location.
- **Sticky jump bar:** `01 experience · 02 disclosures · 03 talks · 04 skills · 05 certifications`, highlighting the current section.
- Each section uses a sticky label column on the left with content on the right.
  - **Experience:** date column (the current role is marked "now" in oxblood), role · company, summary, bullets. Bullet lists longer than four fold behind a `+ N responsibilities` `<details>`.
  - **Disclosures:** table of ID (`—` when none) · Project · Issue (linked to its post, only if that slug exists) · Status.
  - **Talks:** year, serif title, venue, and links (slides / recording / write-up / abstract).
  - **Skills:** run-in heads (italic oxblood serif label, then an inline list with the skill names in full ink).
  - **Certifications:** acronym, full name, and `in progress` with a hollow dot when pending. Nothing is shown for certs already held.
- Contact block ("Want to work together?") and footer.

### 4.5 Search

A header button, or pressing `/`, opens a modal with a Pagefind search input and results (title, type label, excerpt). The index is built after `astro build` (`pagefind --site dist` in `npm run build`), so search works on built output only; under `astro dev` the modal says so. Only post bodies are indexed (`data-pagefind-body`), not the portfolio or the home page. Up to eight results are shown.

### 4.6 404

Uses the site shell: serif "Page not found", a short line, and "Browse writing" (primary) and Portfolio buttons.

## 5. Components

### 5.1 Header / footer / contact block
As in the mockups. The nav's "Talks" links to `/portfolio/#talks`. "Contact" links to the page's contact block (`#contact`), or `/#contact` from post and archive pages. The contact block's heading and text default to `contact` in site.yaml and can be overridden per page.

### 5.2 Post row (index / archive)
Type label in mono (oxblood for advisory and disclosure, `--ink3` otherwise), date, title (Plex Sans 500), summary, tags as `#tag` in mono.

### 5.3 Cover (feature slot)

Resolution order:
1. **`image` set:** a framed image on `--surface` with a dot texture (`radial-gradient` 14px), 34px padding, and the image centred with a 6px radius and soft shadow. Every image cover has a top-left type label / top-right CVE ID (or project) overlay; advisories and disclosures add the 2px oxblood top rule. Photos keep their original colour.
2. **`cover` set:** a **text cover**: `--surface` background with the type (top-left) and the CVE ID or project (top-right) in mono uppercase, and the `cover` string set large in Plex Mono. The part to emphasise is marked in front matter with `**…**` and renders in oxblood. Advisories get the 2px oxblood top rule. Research covers get a faint 22px grid texture.
3. **Neither:** a text cover with the type label and the post title in mono.

### 5.4 Prose
- h2 in serif 31px, h3 in sans 600 19px. Both have `scroll-margin-top` for TOC links. Heading IDs come from Astro's built-in slugging (no separate anchor plugin).
- Links get an oxblood 1px inset underline.
- Inline code on `--code-bg`.
- **Code blocks** (Shiki, custom light/dark themes §3.1, framed by the `codeFrame` transformer in `src/plugins/shiki-code-frame.mjs`): a bar showing the `title="merge.js"` meta (or the language), a copy button, optional line numbers with `ln=N` (numbering starts at N), and line highlighting with `{N,M-P}` (matched against the displayed line numbers). Example: ```` ```js title="merge.js" ln=24 {24} ````.
- **Figures:** Markdown images render framed (as §5.3.1). The alt text is used for the caption, auto-numbered "Fig. N". An image title of `wide` (`![alt](img.png "wide")`) lets a figure extend into the rail gutter (at ≥1180px only).
- **Callouts:** Obsidian syntax `> [!note]`, `> [!tip]` and `> [!warning]`. An optional title can follow the marker. `note` (and `info`) is neutral surface; every other kind (`tip`, `fix`, `warning`, …) has an oxblood left border on `--acc-soft`.
- List markers are mono. (The optional numbered-steps style, 01, 02 in oxblood, was not built.)
- Tables are ruled, with a mono header row.

## 6. Content model

### 6.1 Post front matter (validated by an Astro content-collection schema)

```yaml
title: string                 # required
date: date                    # required
type: advisory | disclosure | research | guide | note   # required
summary: string               # required (lead, index, meta description)
tags: string[]                # optional, lowercased and kebab-cased on build
featured: boolean             # optional
image: ./relative.png         # optional, validated as an existing image
image_alt: string             # required when image is set
cover: string                 # optional, one line; **x** = accent
cve: string                   # optional, e.g. CVE-2024-52286
advisory:                     # optional, drives the facts row
  ghsa: string
  project: string
  component: string
  status: string              # e.g. "Fixed · PR #2189"
  links: { cve: url, ghsa: url }  # optional overrides for the facts-row links
timeline:                     # optional, drives the disclosure timeline
  - { date: string, event: string }
slug: string                  # optional URL slug override (§6.3)
draft: boolean                # optional; drafts show only in `astro dev`
```

The read time is computed from word count (220 wpm, code fences excluded). The build fails on an unknown `type`, a missing `summary`, `image` without `image_alt`, or an image path that doesn't exist.

### 6.2 Site data (`src/data/*.yaml`, schema-validated)

Two YAML files, not content collections. They are imported raw, parsed with the `yaml` package and validated with Zod (`astro/zod`) in `src/lib/data.ts`; a schema error fails the build.
- `site.yaml`: name, role, headline, description, meta_description, links (linkedin, github), repo, contact (heading, text, url).
- `portfolio.yaml`:
  - `intro`: headline, text, location.
  - `experience`: title, company, start, end (omitted for the current role), summary, bullets.
  - `disclosures`: id (optional), project, issue, post slug, status.
  - `talks`: title, short, venue, venue_short (optional, for the home strip), year, links (label → URL).
  - `skills`: a label plus a `text` sentence with each skill name in `[brackets]`.
  - `certs`: acronym, name, `in_progress` (boolean, default false).

### 6.3 File layout for posts

```
src/content/posts/2025-01-09-stirling-pdf-self-xss/
  index.md
  localxss.png
  remotexss.png
```

The slug comes from the folder name minus the date prefix, unless `slug:` is set (the glob loader's `generateId`). Existing posts set `slug:` explicitly to keep their current URLs (§8).

## 7. Authoring workflow

1. In Obsidian, set **Settings → Files & links → Default location for new attachments** to "Same folder as current file". Use a folder per post.
2. Write the post. Pasted images appear as `![[Pasted image 2026….png]]`. A remark plugin converts Obsidian wikilink embeds (`![[file.png]]` and `![[file.png|alt]]`) into standard images resolved relative to the post, so no manual path rewriting is needed.
3. `npm run dev` previews locally, with drafts visible.
4. Commit and push. Cloudflare Pages builds and deploys, and branches get preview URLs.

A `README.md` section documents the front matter fields with one full example.

## 8. URLs and redirects

Current permalinks are `/:categories/:title/`, and every post's category is `blog`, so posts live at `/blog/<filename-title>/`. These must be preserved exactly:

| Post | URL (unchanged) |
|---|---|
| Hello World | `/blog/hello-world/` |
| GraphQL | `/blog/fantastic-graphql-bugs-and-where-to-find-them/` |
| Vite Algolia | `/blog/algolia-api-key-misconfiguration-in-vite/` |
| es-hangul | `/blog/github-actions-command-injection-hangul/` |
| Stirling-PDF | `/blog/self-xss-in-stirling-pdf-cve-2024-52286/` |
| TeslaMate | `/blog/automating-portainer-hosted-teslamate-backups-to-google-drive/` |

Cloudflare `public/_redirects` (301). Jekyll paginated at 5 posts per page, so with six posts only `/page2/` exists; Cloudflare placeholders must fill a whole path segment, so it is listed explicitly. Each source is listed with and without the trailing slash:
```
/about           /portfolio/  301
/about/          /portfolio/  301
/tags            /posts/      301
/tags/*          /posts/      301
/categories      /posts/      301
/categories/*    /posts/      301
/page2           /posts/      301
/page2/          /posts/      301
/feed            /feed.xml    301
```

- **Feeds:** RSS at `/feed.xml` (the same path `jekyll-feed` used), via `@astrojs/rss`.
- **Sitemap:** `@astrojs/sitemap`.
- **SEO:** canonical URLs, OpenGraph tags plus `twitter:card` (image = post `image`, else the bio photo, resized to a 1200px JPEG), and the existing JSON-LD `Person` block. `trailingSlash: 'always'`.
- **Static files:** `public/.well-known/appspecific/com.tesla.3p.public-key.pem` must be served byte-for-byte at the same path. It's used by the Tesla Fleet API.

## 9. Build and hosting

- **Astro 7**, static output. Astro 7's default Markdown processor (Sätteri) doesn't run remark/rehype plugins, so `astro.config.mjs` sets `markdown.processor: unified({ remarkPlugins, rehypePlugins })` from `@astrojs/markdown-remark`. Zod is imported from `astro/zod`.
- Integrations: `@astrojs/rss`, `@astrojs/sitemap`, and Shiki (built in, plus a custom transformer). Plugins in `src/plugins/`: `remark-obsidian-images`, `remark-callouts`, `rehype-figures`, `shiki-code-frame`. Pagefind runs as a post-build step.
- Fonts: `@fontsource/newsreader`, `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-mono`.
- **Cloudflare Pages:** build command `npm run build`, output `dist/`, Node 22 pinned via `.nvmrc`. Cloudflare Web Analytics is enabled in the dashboard, with its beacon auto-injected.
- **Dependabot:** `.github/dependabot.yml` currently has an empty `package-ecosystem`. Set it to `npm` (and add `github-actions` for the CI workflow).

## 10. Removals

- Jekyll and the `minimal-mistakes` remote theme: `_config.yml`, `Gemfile`, `_layouts/`, `_includes/`, `_data/`, `_pages/`, `assets/css/main.scss`, `index.html`.
- `DefaultThemeStuff/` (theme sample posts).
- `_includes/skills.html` (percentage bars) and `_includes/timeline.html`, whose content moves into the §6.2 YAML files.
- Google Analytics gtag and the Cookiebot include.
- Draft `.md` files inside `images/`. Images move into their post folders; `images/` is deleted once nothing references it.
- `assets/images/zuko.gif` and the old About page content. `/about/` redirects to `/portfolio/`.

## 11. Content migration

Each post moves into its own folder with updated front matter. The body wording stays the author's own. Mechanical fixes only:
- Remove the duplicated title H1 at the top of the body where present.
- Convert the table-hack image captions (`| ![x](y) |` + caption row) into plain images with alt text as the caption.
- Normalise tags to lowercase kebab-case (e.g. `Appsec`/`AppSec` → `appsec`).
- Fix the **CVE-2024-52285** reference link in the Stirling-PDF post to **CVE-2024-52286**.
- Rewrite image paths to be folder-relative, with kebab-case file names (e.g. `local-xss.png`).
- Stirling-PDF: typo fixes ("assigned assigned", "SanitiSe", "Ths"); the self-referential hotanya.fyi link in the references replaced by the fix PR link.
- GraphQL: a broken GitHub blob-URL image replaced by the local image; the two videos moved to `public/media/` (`graphql-idor.mp4`, `graphql-injection.mp4`).
- TeslaMate: a mis-indented nested list fixed.

Titles changed to the sentence-case titles in the approved mockups:

| Old title | New title |
|---|---|
| Hello World! | Hello World! (unchanged) |
| Fantastic GraphQL Bugs And Where To Find Them | Fantastic GraphQL bugs and where to find them |
| Algolia API Key Misconfiguration in Vite | Admin-scoped Algolia API key exposed in Vite |
| Command Injection In es-hangul Github Actions Workflow | Command injection in the es-hangul GitHub Actions workflow |
| CVE-2024-52286 - Self XSS in Stirling PDF | Self-XSS in Stirling-PDF's merge feature |
| Automating Portainer Hosted Teslamate Backups to Google Drive | Automating Portainer-hosted TeslaMate backups to Google Drive |

Metadata as migrated (summaries and cover lines are drafts for the author to confirm):

| Post | type | cover | extra |
|---|---|---|---|
| Stirling-PDF | advisory | `**<img src=x onerror=alert(1)>**.pdf` | cve CVE-2024-52286; advisory {ghsa GHSA-9j55-gvf2-cqwv, project Stirling-PDF, component merge.js, status "Fixed · PR #2189"}; timeline {10 Sep 2024 reported; Nov 2024 fix merged; published 09 Jan 2025}; image local-xss.png; featured |
| es-hangul | disclosure | `run: yarn blc **${{ github.event.inputs.url }}** --ro` | image injection-output.png; advisory {project es-hangul, component broken-link-checker.yml, status "Reported with fix PR"} |
| Vite Algolia | disclosure | `acl: [ "addObject", **"deleteIndex"**, "editSettings" ]` (no key material) | advisory {project vitejs/vite, component .vitepress/config.ts, status "Reported · resolved"} |
| GraphQL | research | `query { **__schema** { types { name } } }` | links to the OWASP NZ Day 2022 recording |
| TeslaMate | guide | `rclone copy --max-age 24h ./tmbackup **gdrive:Teslamate**` | |
| Hello World | note | none | |

### Portfolio data (from the current `_includes/timeline.html`, with corrections)
- Plexure: Senior Application Security Engineer, Mar 2026 – now (9 responsibilities).
- Bastion Security: Lead Security Consultant, **Jun 2025 – Mar 2026** (corrected; it previously said Present).
- Kiwibank: Jul 2024 – Jun 2025. CyberCX: Senior Consultant & Team Lead, Oct 2022 – Jul 2024; Security Consultant, Mar 2021 – Oct 2022. Insomnia Security: Security Consultant, Mar 2019 – Mar 2021.
- Insomnia Security: Project Delivery Coordinator, **Feb 2018 – Mar 2019** (corrected; it previously said Mar 2021 – Aug 2022).
- Certs: CAPen, CCSP-AWS (earned); OSCP, CRTO (in progress).
- Disclosures: Stirling-PDF (CVE-2024-52286), es-hangul and vitejs/vite, each linked to its post.
- Talks: the four existing talks, with their current links.
- Skills: the current list regrouped into Offensive testing / Cloud / AppSec programme / Code.

## 12. Out of scope

- Contact form and meeting booking (a later project; the contact CTA links to `contact.url` for now).
- Comments, share counters, newsletter.
- A CMS, or any server-side runtime.

## 13. Verification

- `astro check` and `astro build` pass in CI (GitHub Actions on PRs).
- A link check (e.g. `lychee`) over `dist/` finds no broken internal links.
- A script requests every URL in §8 plus each redirect source against the Cloudflare preview deployment. Each must return 200, or 301 to the expected target.
- `/.well-known/appspecific/com.tesla.3p.public-key.pem` on the preview matches the repo file's hash.
- Visual check of home, archive, a post, portfolio, search and 404 at 1440px, 768px and 375px, in both themes, against the mockups.
- Lighthouse on home and a post: accessibility ≥ 95; contrast of `--ink3` on `--bg` checked (it's used only for metadata).
- `/feed.xml` validates, and the sitemap lists all posts.

## 14. Open items for the author

- Confirm the per-post summaries and cover lines in §11.
- Portfolio intro headline and paragraph wording.
- ~~Contact CTA target until booking exists.~~ Resolved: "Get in touch" links to `contact.url` in `src/data/site.yaml`, currently LinkedIn; change it there to a `mailto:` or booking URL. The contact block's secondary button is GitHub; the portfolio intro's is LinkedIn.

