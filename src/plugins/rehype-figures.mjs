// A paragraph holding only an image becomes a framed, numbered figure. The alt
// text is the caption; ![alt](img.png "wide") lets it extend into the rail gutter.
import { visit } from 'unist-util-visit';

const isBlank = (n) => n.type === 'text' && !n.value.trim();

export function rehypeFigures() {
  return (tree) => {
    let n = 0;
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'p' || !parent) return;
      const kids = node.children.filter((c) => !isBlank(c));
      if (kids.length !== 1 || kids[0].tagName !== 'img') return;
      const img = kids[0];
      const alt = String(img.properties.alt ?? '').trim();
      const wide = img.properties.title === 'wide';
      if (wide) delete img.properties.title;
      img.properties.loading = 'lazy';
      // The figcaption carries the description, so the image itself is decorative here.
      // Without this a screen reader reads the alt text and then the identical caption.
      img.properties.alt = '';
      n += 1;
      const caption = [{ type: 'element', tagName: 'b', properties: {}, children: [{ type: 'text', value: `Fig. ${n}` }] }];
      if (alt) caption.push({ type: 'element', tagName: 'span', properties: {}, children: [{ type: 'text', value: alt }] });
      parent.children[index] = {
        type: 'element',
        tagName: 'figure',
        properties: { className: wide ? ['shot', 'wide'] : ['shot'] },
        children: [
          { type: 'element', tagName: 'div', properties: { className: ['fr'] }, children: [img] },
          { type: 'element', tagName: 'figcaption', properties: {}, children: caption },
        ],
      };
    });
  };
}
