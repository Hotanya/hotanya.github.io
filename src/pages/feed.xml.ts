// RSS at /feed.xml, the same path jekyll-feed used, so existing subscribers keep working.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../lib/data';
import { getPosts, postUrl } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: site.name,
    description: site.meta_description,
    site: context.site!,
    trailingSlash: true,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.summary,
      link: postUrl(p),
      categories: p.data.tags,
    })),
  });
}
