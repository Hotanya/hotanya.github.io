// Site and portfolio copy lives in YAML so it can be edited without touching
// templates. Both files are validated here; a typo fails the build.
import { parse } from 'yaml';
import { z } from 'astro/zod';
import siteRaw from '../data/site.yaml?raw';
import portfolioRaw from '../data/portfolio.yaml?raw';

const Site = z.object({
  name: z.string(),
  role: z.string(),
  headline: z.string(),
  description: z.string(),
  meta_description: z.string(),
  links: z.object({ linkedin: z.string(), github: z.string() }),
  repo: z.string(),
  contact: z.object({ heading: z.string(), text: z.string(), url: z.string() }),
});

const Portfolio = z.object({
  intro: z.object({ headline: z.string(), text: z.string(), location: z.string() }),
  experience: z.array(
    z.object({
      title: z.string(),
      company: z.string(),
      start: z.string(),
      end: z.string().optional(),
      summary: z.string().optional(),
      bullets: z.array(z.string()).default([]),
    }),
  ),
  disclosures: z.array(
    z.object({
      id: z.string().optional(),
      project: z.string(),
      issue: z.string(),
      post: z.string().optional(),
      status: z.string(),
    }),
  ),
  talks: z.array(
    z.object({
      title: z.string(),
      short: z.string(),
      venue: z.string(),
      venue_short: z.string().optional(),
      year: z.number(),
      links: z.record(z.string(), z.string()).default({}),
    }),
  ),
  skills: z.array(z.object({ label: z.string(), text: z.string() })),
  certs: z.array(z.object({ acronym: z.string(), name: z.string(), in_progress: z.boolean().default(false) })),
});

const load = <T extends z.ZodType>(schema: T, raw: string, file: string): z.infer<T> => {
  const result = schema.safeParse(parse(raw));
  if (!result.success) throw new Error(`Invalid ${file}:\n${z.prettifyError(result.error)}`);
  return result.data;
};

export const site = load(Site, siteRaw, 'src/data/site.yaml');
export const portfolio = load(Portfolio, portfolioRaw, 'src/data/portfolio.yaml');
