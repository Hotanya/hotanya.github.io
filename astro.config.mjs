// @ts-check
import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { remarkObsidianImages } from './src/plugins/remark-obsidian-images.mjs';
import { remarkCallouts } from './src/plugins/remark-callouts.mjs';
import { rehypeFigures } from './src/plugins/rehype-figures.mjs';
import { codeFrame } from './src/plugins/shiki-code-frame.mjs';
import { fieldNotesLight, fieldNotesDark } from './src/lib/shiki-themes.mjs';

export default defineConfig({
  site: 'https://hotanya.fyi',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      // Conservative hints: home and posts rank highest, static pages lower.
      serialize(item) {
        if (item.url === 'https://hotanya.fyi/') {
          item.changefreq = ChangeFreqEnum.WEEKLY;
          item.priority = 1.0;
        } else if (item.url.includes('/blog/')) {
          item.changefreq = ChangeFreqEnum.MONTHLY;
          item.priority = 0.8;
        } else {
          item.changefreq = ChangeFreqEnum.MONTHLY;
          item.priority = 0.6;
        }
        return item;
      },
    }),
  ],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkObsidianImages, remarkCallouts],
      rehypePlugins: [rehypeFigures],
    }),
    shikiConfig: {
      themes: { light: fieldNotesLight, dark: fieldNotesDark },
      defaultColor: false,
      transformers: [codeFrame()],
    },
  },
});
