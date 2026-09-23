// Turns Obsidian embeds (![[file.png]] and ![[file.png|alt]]) into standard
// Markdown images resolved relative to the post, so pasted images just work.
import { visit, SKIP } from 'unist-util-visit';

const EMBED = /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g;
const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

export function remarkObsidianImages() {
  return (tree) => {
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || !node.value.includes('![[')) return;
      const parts = [];
      let last = 0;
      for (const m of node.value.matchAll(EMBED)) {
        const file = m[1].trim();
        if (!IMAGE_EXT.test(file)) continue;
        if (m.index > last) parts.push({ type: 'text', value: node.value.slice(last, m.index) });
        // Obsidian uses |300 for width; only treat non-numeric text as alt.
        const label = m[2]?.trim();
        const alt = label && !/^\d+(x\d+)?$/.test(label) ? label : file.replace(IMAGE_EXT, '');
        const url = file.startsWith('.') || file.startsWith('/') ? file : `./${file}`;
        parts.push({ type: 'image', url: encodeURI(url), alt, title: null });
        last = m.index + m[0].length;
      }
      if (!parts.length) return;
      if (last < node.value.length) parts.push({ type: 'text', value: node.value.slice(last) });
      parent.children.splice(index, 1, ...parts);
      return [SKIP, index + parts.length];
    });
  };
}
