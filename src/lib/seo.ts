// Per-page JSON-LD builders, emitted through Base.astro's `jsonld` prop.
// The site-wide Person node stays in Base.astro; these add page-level nodes.
import { site } from './data';
import type { Post } from './posts';

/** Canonical author identity, matching the Person node in Base.astro. */
export const AUTHOR_URL = 'https://hotanya.fyi';
const author = { '@type': 'Person', name: site.name, url: AUTHOR_URL } as const;

/** Technical write-ups map to TechArticle; looser notes to BlogPosting. */
const articleType = (type: string) => (type === 'note' ? 'BlogPosting' : 'TechArticle');

/** BlogPosting/TechArticle node for a post page. `url` and `image` must be absolute. */
export function articleLd(post: Post, opts: { url: string; image: string }): Record<string, unknown> {
  const { data } = post;
  const published = data.date.toISOString();
  return {
    '@context': 'https://schema.org',
    '@type': articleType(data.type),
    headline: data.title,
    description: data.summary,
    datePublished: published,
    dateModified: published,
    author,
    publisher: author,
    image: opts.image,
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
    articleSection: data.type,
    ...(data.tags.length ? { keywords: data.tags.join(', ') } : {}),
  };
}

/** BreadcrumbList node. Each item's `url` must be absolute. */
export function breadcrumbLd(items: { name: string; url: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
