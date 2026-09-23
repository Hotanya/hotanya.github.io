// Obsidian callouts: > [!note] Optional title  ->  <div class="callout note">
import { visit } from 'unist-util-visit';

const LABELS = { note: 'Note', tip: 'Tip', fix: 'The fix', warning: 'Warning', info: 'Note' };
const NEUTRAL = new Set(['note', 'info']);

export function remarkCallouts() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      const first = node.children[0];
      const text = first?.type === 'paragraph' ? first.children[0] : null;
      if (text?.type !== 'text') return;
      const m = text.value.match(/^\[!(\w+)\][+-]?[ \t]*([^\n]*)\n?/);
      if (!m) return;
      const kind = m[1].toLowerCase();
      const title = m[2].trim() || LABELS[kind] || kind;
      text.value = text.value.slice(m[0].length);
      if (!text.value) first.children.shift();
      if (!first.children.length) node.children.shift();
      node.data = { hName: 'div', hProperties: { className: ['callout', NEUTRAL.has(kind) ? 'note' : kind] } };
      node.children.unshift({
        type: 'paragraph',
        data: { hName: 'div', hProperties: { className: ['h'] } },
        children: [{ type: 'text', value: title }],
      });
    });
  };
}
