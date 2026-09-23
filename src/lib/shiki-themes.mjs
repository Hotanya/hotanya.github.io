// Syntax themes tuned to the Mist + oxblood palette (spec §3.1).
const make = (name, type, c) => ({
  name,
  type,
  colors: { 'editor.background': c.bg, 'editor.foreground': c.fg },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.com, fontStyle: 'italic' } },
    { scope: ['keyword', 'storage', 'storage.type', 'storage.modifier', 'keyword.operator.new', 'variable.language', 'support.variable.dom'], settings: { foreground: c.kw } },
    { scope: ['string', 'string.quoted', 'string.template', 'markup.inline.raw'], settings: { foreground: c.str } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call entity.name.function'], settings: { foreground: c.fn } },
    { scope: ['variable.other.property', 'support.type.property-name', 'entity.name.tag', 'meta.object-literal.key', 'entity.other.attribute-name'], settings: { foreground: c.prop } },
    { scope: ['constant.numeric', 'constant.language', 'constant.other'], settings: { foreground: c.kw } },
    { scope: ['punctuation', 'meta.brace'], settings: { foreground: c.punc } },
  ],
});

export const fieldNotesLight = make('field-notes-light', 'light', {
  bg: '#e7e5ec', fg: '#19181d', kw: '#942c30', str: '#3f6b4f', fn: '#4a4a8c', prop: '#7a4f1f', com: '#8f8d98', punc: '#4e4c56',
});
export const fieldNotesDark = make('field-notes-dark', 'dark', {
  bg: '#1e1d23', fg: '#e9e8ee', kw: '#e2848a', str: '#9cc7a4', fn: '#a9a9ec', prop: '#e0b27a', com: '#6f6d78', punc: '#a6a4ae',
});
