import { Extension, type Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

interface SearchPluginState {
	query: string;
	decorations: DecorationSet;
}

const searchKey = new PluginKey<SearchPluginState>('searchHighlight');

function buildDecorations(doc: PMNode, query: string): DecorationSet {
	if (!query) return DecorationSet.empty;
	const needle = query.toLowerCase();
	const decorations: Decoration[] = [];

	doc.descendants((node, pos) => {
		if (!node.isText || !node.text) return;
		const hay = node.text.toLowerCase();
		let idx = 0;
		while ((idx = hay.indexOf(needle, idx)) !== -1) {
			decorations.push(
				Decoration.inline(pos + idx, pos + idx + needle.length, { class: 'search-hit' })
			);
			idx += needle.length;
		}
	});

	return decorations.length ? DecorationSet.create(doc, decorations) : DecorationSet.empty;
}

export const SearchHighlight = Extension.create({
	name: 'searchHighlight',

	addProseMirrorPlugins() {
		return [
			new Plugin<SearchPluginState>({
				key: searchKey,
				state: {
					init: () => ({ query: '', decorations: DecorationSet.empty }),
					apply(tr, prev) {
						const meta = tr.getMeta(searchKey) as { query?: string } | undefined;
						if (meta && typeof meta.query === 'string' && meta.query !== prev.query) {
							return { query: meta.query, decorations: buildDecorations(tr.doc, meta.query) };
						}
						if (tr.docChanged && prev.query) {
							return { query: prev.query, decorations: buildDecorations(tr.doc, prev.query) };
						}
						return prev;
					}
				},
				props: {
					decorations(state) {
						return searchKey.getState(state)?.decorations;
					}
				}
			})
		];
	}
});

export function setSearchHighlight(editor: Editor, query: string): void {
	const view = editor.view;
	const current = searchKey.getState(view.state);
	if (current?.query === query) return;
	view.dispatch(view.state.tr.setMeta(searchKey, { query }));
}
