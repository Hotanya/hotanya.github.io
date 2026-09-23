# hotanya.fyi

Personal blog and portfolio. Static site built with [Astro](https://astro.build) 7, Markdown content
collections, Shiki code highlighting and [Pagefind](https://pagefind.app) search. Hosted on Cloudflare Pages.

## Local development

Requires Node 22.12 or newer (`.nvmrc` pins 22).

```sh
npm install
npm run dev        # http://localhost:4321, live reload
npm run check      # astro check (types + content schema)
```

Search is built by Pagefind after `astro build`, so it does not work under `npm run dev`. To try it:

```sh
npm run build && npm run preview
```

## Deployment (Cloudflare Pages)

| Setting                | Value           |
| ---------------------- | --------------- |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Environment variable   | `NODE_VERSION=22` |

`npm run build` runs `astro build && pagefind --site dist`. CI (`.github/workflows/ci.yml`) runs
`astro check` and the build on every pull request and push to `master`.

## Writing a post

Each post is a folder under `src/content/posts/`, named `YYYY-MM-DD-slug`, containing `index.md`.
Put images in the same folder and reference them relatively:

```
src/content/posts/2025-01-09-stirling-pdf-self-xss/
  index.md
  local-xss.png
  remote-xss.png
```

The URL is `/blog/<slug>/`. The slug is the `slug:` front-matter field if set, otherwise the folder
name with its date prefix removed.

**Obsidian tip:** in Settings > Files and links, set "Default location for new attachments" to
"Same folder as current file". Pasted images then land next to `index.md` and the `![[image.png]]`
embed Obsidian writes works as-is.

### Front matter

Defined in `src/content.config.ts`. An invalid field fails the build.

| Field       | Type | Required | Notes |
| ----------- | ---- | -------- | ----- |
| `title`     | string | yes | |
| `date`      | date | yes | e.g. `2025-01-09T13:37:00+12:00`. Posts sort newest first. |
| `type`      | `advisory` \| `disclosure` \| `research` \| `guide` \| `note` | yes | `advisory` and `disclosure` get the accent (oxblood) treatment and share the "Advisories" filter. |
| `summary`   | string | yes | Lead paragraph, list card text, meta description and RSS description. |
| `tags`      | string[] | no | Default `[]`. Normalised to kebab-case (`Open Source` becomes `open-source`). |
| `featured`  | boolean | no | Default `false`. See [Featured post](#featured-post). |
| `image`     | path | no | Relative image, e.g. `./shot.png`. Shown as the lead figure (skipped when the body already embeds the same file) and in the featured slot; also used as the social preview image. |
| `image_alt` | string | if `image` set | Build fails if `image` is set without it. |
| `cover`     | string | no | Text cover for the featured slot when there is no `image`. Wrap a phrase in `**double asterisks**` to set it in the accent colour. Falls back to the title. |
| `cve`       | string | no | e.g. `CVE-2024-52286`. Shown in the facts panel and on list cards. |
| `advisory`  | object | no | `ghsa`, `project`, `component`, `status`, and `links: { cve, ghsa }`, all optional strings. Rendered in the facts panel. |
| `timeline`  | `{ date, event }[]` | no | Both strings. Rendered as a "Disclosure timeline" section. |
| `slug`      | string | no | Overrides the URL slug. |
| `draft`     | boolean | no | Default `false`. See [Drafts](#drafts). |

Complete example:

```yaml
---
title: Self-XSS in Stirling-PDF's merge feature
date: 2025-01-09T13:37:00+12:00
type: advisory
summary: Unsanitised PDF file names were rendered straight into the result page.
tags: [xss, open-source, appsec]
featured: true
image: ./local-xss.png
image_alt: Stirling-PDF merge page showing an alert(1) dialog
cover: "**<img src=x onerror=alert(1)>**.pdf"
cve: CVE-2024-52286
advisory:
  ghsa: GHSA-9j55-gvf2-cqwv
  project: Stirling-PDF
  component: merge.js
  status: "Fixed · PR #2189"
  links:
    cve: https://www.cve.org/CVERecord?id=CVE-2024-52286
    ghsa: https://github.com/Stirling-Tools/Stirling-PDF/security/advisories/GHSA-9j55-gvf2-cqwv
timeline:
  - { date: 10 Sep 2024, event: Reported to maintainer }
  - { date: Nov 2024, event: "Fix merged · PR #2189" }
  - { date: 09 Jan 2025, event: Published }
slug: self-xss-in-stirling-pdf-cve-2024-52286
draft: false
---
```

### Markdown extras

Plugins live in `src/plugins/`.

**Obsidian image embeds.** `![[shot.png]]` and `![[shot.png|Alt text]]` become normal images
resolved relative to the post. A numeric label such as `|300` (Obsidian's width syntax) is ignored
and the file name is used as alt text.

**Callouts.** A blockquote starting with `[!kind]` becomes a callout. The rest of the first line is
an optional title; without one a default label is used.

```md
> [!note] Optional title
> Body text.
```

| Kind      | Default label | Style |
| --------- | ------------- | ----- |
| `note`, `info` | Note | neutral |
| `tip`     | Tip | accent |
| `fix`     | The fix | accent |
| `warning` | Warning | accent |

**Figures.** A paragraph containing only an image becomes a framed, numbered figure (`Fig. 1`,
`Fig. 2`, ...) with the alt text as its caption. Add the title `"wide"` to let it extend into the
right-hand gutter on wide screens:

```md
![Payload executing on a local instance](./local-xss.png)
![Full request flow](./flow.png "wide")
```

**Code fences.** Every block gets a bar with the language (or title) and a copy button. Optional meta:

````md
```js title="merge.js" ln=24 {24}
document.getElementById("filename").innerHTML = userInputFileName;
```
````

- `title="..."` sets the bar label (defaults to the language).
- `ln=N` shows line numbers starting at N.
- `{24}`, `{3-5}` or `{1,4-6}` highlights those lines, using the displayed line numbers.

## Editing site copy

Home and portfolio copy is YAML, validated at build time by `src/lib/data.ts`:

- `src/data/site.yaml` — name, role, home headline, descriptions, social links, repo URL, contact block.
- `src/data/portfolio.yaml` — intro, experience, disclosures, talks, skills, certs.

Formatting inside the YAML:

- `*phrase*` in a `headline` (`site.yaml` `headline`, `portfolio.yaml` `intro.headline`) sets that
  phrase in the accent colour.
- `[skill]` in a `skills[].text` entry marks a skill name, e.g. `"[AWS] and [Azure] security reviews."`

## Featured post

The home page features the newest post with `featured: true`. If no post is flagged, the newest post
is featured.

## Drafts

`draft: true` posts appear under `npm run dev` only. They are left out of the production build
(pages, lists, RSS feed and search).

## Redirects

Cloudflare Pages redirects are in `public/_redirects` (old Jekyll URLs to their new homes).
