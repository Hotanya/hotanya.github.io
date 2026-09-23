// Shiki transformer: filename bar + copy button, optional line numbers and
// highlighted lines. Meta syntax: ```js title="merge.js" ln=24 {24}
const parseMeta = (raw = '') => {
  const title = raw.match(/title="([^"]+)"/)?.[1];
  const ln = raw.match(/\bln=(\d+)/)?.[1];
  const hl = new Set();
  const range = raw.match(/\{([\d,\s-]+)\}/)?.[1];
  if (range) {
    for (const part of range.split(',')) {
      const [a, b] = part.trim().split('-').map(Number);
      for (let i = a; i <= (b || a); i++) hl.add(i);
    }
  }
  return { title, start: ln ? Number(ln) : null, hl };
};

export function codeFrame() {
  return {
    name: 'code-frame',
    line(node, line) {
      const { start, hl } = parseMeta(this.options.meta?.__raw);
      const n = (start ?? 1) + line - 1;
      if (start !== null) {
        node.children.unshift({ type: 'element', tagName: 'span', properties: { className: ['ln'], 'aria-hidden': 'true' }, children: [{ type: 'text', value: String(n) }] });
      }
      if (hl.has(n)) this.addClassToHast(node, 'hl');
    },
    root(root) {
      const { title } = parseMeta(this.options.meta?.__raw);
      const lang = this.options.lang && this.options.lang !== 'plaintext' && this.options.lang !== 'text' ? this.options.lang : '';
      const bar = {
        type: 'element', tagName: 'div', properties: { className: ['bar'] },
        children: [
          { type: 'element', tagName: 'span', properties: {}, children: [{ type: 'text', value: title || lang }] },
          { type: 'element', tagName: 'button', properties: { type: 'button', className: ['copy'], 'data-copy': '' }, children: [{ type: 'text', value: 'copy' }] },
        ],
      };
      root.children = [{ type: 'element', tagName: 'div', properties: { className: ['code'] }, children: [bar, ...root.children] }];
    },
  };
}
