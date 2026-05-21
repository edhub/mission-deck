const TIPTAP_HTML_HINT = /^\s*<(p|pre|ul|ol|blockquote|h[1-6]|hr|br)(\s|>|\/)/i;

export type EditorDefaultTag = 'p' | 'h1' | 'h2' | 'h3';

export function normalizeContent(value: string, defaultTag: EditorDefaultTag = 'p'): string {
	if (TIPTAP_HTML_HINT.test(value)) return value;
	if (!value) return `<${defaultTag}></${defaultTag}>`;

	const escaped = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

	return `<${defaultTag}>${escaped.replace(/\n/g, '<br>')}</${defaultTag}>`;
}

export function isEmptyHtml(html: string): boolean {
	return (
		html
			.replace(/<[^>]+>/g, '')
			.replace(/&nbsp;/g, '')
			.replace(/[\s\u00a0]/g, '').length === 0
	);
}
