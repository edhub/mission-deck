const TIPTAP_HTML_HINT = /^\s*<(p|pre|ul|ol|blockquote|h[1-6]|hr|br)(\s|>|\/)/i;

export function normalizeContent(value: string): string {
	if (!value) return '';
	if (TIPTAP_HTML_HINT.test(value)) return value;

	const escaped = value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

	return `<p>${escaped.replace(/\n/g, '<br>')}</p>`;
}

export function isEmptyHtml(html: string): boolean {
	return (
		html
			.replace(/<[^>]+>/g, '')
			.replace(/&nbsp;/g, '')
			.replace(/[\s\u00a0]/g, '').length === 0
	);
}
