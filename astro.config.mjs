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
  // Emits a <meta> CSP with hashes for every inline script/style Astro renders.
  // frame-ancestors can't go in a <meta> CSP, so it lives in public/_headers.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        // The GraphQL post hot-links two images.
        "img-src 'self' data: https://s3.amazonaws.com https://media2.giphy.com",
        "font-src 'self'",
        "media-src 'self'",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      // Pagefind search compiles a WebAssembly module.
      scriptDirective: { resources: ["'self'", "'wasm-unsafe-eval'"] },
      // Shiki colours code tokens with style="--shiki-light:…" attributes.
      styleDirective: { resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }] },
    },
  },
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
  vite: {
    // Astro inlines small scripts before Vite fills in its preload placeholder,
    // leaving a bare __VITE_PRELOAD__ that breaks Search.astro's pagefind import.
    // Ship scripts as files instead (also keeps them under the CSP's 'self').
    build: { assetsInlineLimit: 0 },
  },
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
