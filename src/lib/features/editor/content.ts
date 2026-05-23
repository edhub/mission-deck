const TIPTAP_HTML_HINT = /^\s*<(p|pre|ul|ol|blockquote|h[1-6]|hr|br)(\s|>|\/)/i;
const ALLOWED_TAGS = new Set([
	'p',
	'br',
	'ul',
	'ol',
	'li',
	'h1',
	'h2',
	'h3',
	'strong',
	'em',
	's',
	'strike',
	'u',
	'code',
	'a',
	'div',
	'label',
	'input'
]);

export type EditorDefaultTag = 'p' | 'h1' | 'h2' | 'h3';

function escapeHtml(value: string) {
	return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function normalizeContent(value: string, defaultTag: EditorDefaultTag = 'p'): string {
	if (TIPTAP_HTML_HINT.test(value)) return value;
	if (!value) return `<${defaultTag}></${defaultTag}>`;

	return `<${defaultTag}>${escapeHtml(value).replace(/\n/g, '<br>')}</${defaultTag}>`;
}

export function isEmptyHtml(html: string): boolean {
	return (
		html
			.replace(/<[^>]+>/g, '')
			.replace(/&nbsp;/g, '')
			.replace(/[\s\u00a0]/g, '').length === 0
	);
}

function isSafeHref(value: string) {
	try {
		const url = new URL(value, 'https://mission-deck.local');
		return ['http:', 'https:', 'mailto:'].includes(url.protocol);
	} catch {
		return false;
	}
}

function sanitizeNode(node: Node, document: Document): Node | DocumentFragment | undefined {
	if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent ?? '');
	if (node.nodeType !== Node.ELEMENT_NODE) return undefined;

	const element = node as Element;
	const tagName = element.tagName.toLowerCase();
	const children = Array.from(element.childNodes);

	if (!ALLOWED_TAGS.has(tagName)) {
		const fragment = document.createDocumentFragment();
		for (const child of children) {
			const sanitized = sanitizeNode(child, document);
			if (sanitized) fragment.append(sanitized);
		}
		return fragment;
	}

	const clean = document.createElement(tagName);
	if (tagName === 'a') {
		const href = element.getAttribute('href');
		if (href && isSafeHref(href)) {
			clean.setAttribute('href', href);
			clean.setAttribute('rel', 'noreferrer');
		}
	}
	if (tagName === 'ul' && element.getAttribute('data-type') === 'taskList') {
		clean.setAttribute('data-type', 'taskList');
	}
	if (tagName === 'li') {
		const isTaskItem =
			element.getAttribute('data-type') === 'taskItem' || element.hasAttribute('data-checked');
		if (isTaskItem) {
			clean.setAttribute('data-type', 'taskItem');
			const dataChecked = element.getAttribute('data-checked');
			const checked = dataChecked === 'true' || dataChecked === '';
			clean.setAttribute('data-checked', checked ? 'true' : 'false');
		}
	}
	if (tagName === 'input') {
		clean.setAttribute('type', 'checkbox');
		clean.setAttribute('disabled', '');
		if (element.hasAttribute('checked')) clean.setAttribute('checked', '');
	}

	for (const child of children) {
		const sanitized = sanitizeNode(child, document);
		if (sanitized) clean.append(sanitized);
	}
	return clean;
}

// Browser-only: relies on DOM parsing. Callers should gate on `browser` or call from onMount.
// Returns empty string under SSR to avoid leaking escaped HTML as visible text.
export function sanitizeTiptapHtml(html: string): string {
	if (typeof document === 'undefined') return '';

	const template = document.createElement('template');
	template.innerHTML = normalizeContent(html);
	const fragment = document.createDocumentFragment();

	for (const child of Array.from(template.content.childNodes)) {
		const sanitized = sanitizeNode(child, document);
		if (sanitized) fragment.append(sanitized);
	}

	const wrapper = document.createElement('div');
	wrapper.append(fragment);
	return wrapper.innerHTML;
}
