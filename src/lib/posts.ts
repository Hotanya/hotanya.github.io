import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** Published posts, newest first. Drafts show only in `astro dev`. */
export async function getPosts(): Promise<Post[]> {
  const all = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** The flagged post if there is one, otherwise the newest. */
export const pickFeatured = (posts: Post[]) => posts.find((p) => p.data.featured) ?? posts[0];

export const postUrl = (p: Post | string) => `/blog/${typeof p === 'string' ? p : p.id}/`;

export function readTime(body = ''): number {
  const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

// Fixed three-letter months: Intl prints "Sept" in some locales.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const parts = (d: Date) => {
  const f = new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', day: '2-digit', month: 'numeric', year: 'numeric' });
  const get = (t: string) => f.formatToParts(d).find((p) => p.type === t)!.value;
  return { day: get('day'), month: MONTHS[Number(get('month')) - 1], year: Number(get('year')) };
};
export const fullDate = (d: Date) => { const p = parts(d); return `${p.day} ${p.month} ${p.year}`; };
export const monthYear = (d: Date) => { const p = parts(d); return `${p.month} ${p.year}`.toLowerCase(); };
export const year = (d: Date) => parts(d).year;

/** Advisories and disclosures get the oxblood detail; everything else stays neutral. */
export const isAdvisoryLike = (type: string) => type === 'advisory' || type === 'disclosure';

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** `*phrase*` -> <em>phrase</em>, everything else escaped. For headlines. */
export const accentEm = (s: string) => escape(s).replace(/\*(.+?)\*/g, '<em>$1</em>');

/** `**phrase**` -> accent span, everything else escaped. For text covers. */
export const coverHtml = (s: string) => escape(s).replace(/\*\*(.+?)\*\*/g, '<i>$1</i>');

/** `[skill]` -> <span>skill</span>, everything else escaped. For run-in skills. */
export const runInHtml = (s: string) => escape(s).replace(/\[(.+?)\]/g, '<span>$1</span>');
