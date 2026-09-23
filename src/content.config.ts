import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export const POST_TYPES = ['advisory', 'disclosure', 'research', 'guide', 'note'] as const;

const kebab = (t: string) => t.trim().toLowerCase().replace(/[\s_]+/g, '-');

const posts = defineCollection({
  loader: glob({
    pattern: '**/index.md',
    base: './src/content/posts',
    // URL slug: explicit `slug:` wins, otherwise the folder name minus its date prefix.
    generateId: ({ entry, data }) =>
      (data.slug as string | undefined) ?? entry.split('/')[0].replace(/^\d{4}-\d{2}-\d{2}-/, ''),
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        date: z.coerce.date(),
        type: z.enum(POST_TYPES),
        summary: z.string(),
        tags: z.array(z.string()).default([]).transform((t) => t.map(kebab)),
        featured: z.boolean().default(false),
        image: image().optional(),
        image_alt: z.string().optional(),
        cover: z.string().optional(),
        cve: z.string().optional(),
        advisory: z
          .object({
            ghsa: z.string().optional(),
            project: z.string().optional(),
            component: z.string().optional(),
            status: z.string().optional(),
            links: z.object({ cve: z.string().optional(), ghsa: z.string().optional() }).optional(),
          })
          .optional(),
        timeline: z.array(z.object({ date: z.string(), event: z.string() })).optional(),
        slug: z.string().optional(),
        draft: z.boolean().default(false),
      })
      .refine((d) => !d.image || !!d.image_alt, {
        message: 'image_alt is required when image is set',
        path: ['image_alt'],
      }),
});

export const collections = { posts };
