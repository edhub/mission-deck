import { Extension, type Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { canSplit } from '@tiptap/pm/transform';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import StarterKit from '@tiptap/starter-kit';
import { SearchHighlight } from './searchHighlight';

export interface TaskKeymapOptions {
	onEnter?: () => boolean;
	onEscape?: () => boolean;
}

// Workaround for @tiptap/core splitBlock: when a non-empty selection ends at
// the start of an empty textblock, deleteSelection lifts the cursor to the
// doc, then split injects a slice whose openStart exceeds the position depth
// ("Inserted content deeper than insertion position"). Detect and handle it.
function splitAcrossEmptyTail(editor: Editor): boolean {
	const { state, view, schema } = editor;
	const { selection } = state;
	if (selection.empty) return false;

	const { $to } = selection;
	if (!$to.parent.isTextblock || $to.depth === 0) return false;
	if ($to.parentOffset !== 0 || $to.parent.content.size !== 0) return false;

	const tr = state.tr.deleteSelection();
	if (tr.selection.$from.depth === 0) {
		const pos = Math.min(tr.selection.from + 1, tr.doc.content.size);
		tr.setSelection(TextSelection.create(tr.doc, pos));
	}
	const $from = tr.selection.$from;
	if (!$from.parent.isTextblock) return false;

	const paragraph = schema.nodes.paragraph;
	const types = paragraph ? [{ type: paragraph }] : undefined;
	if (!canSplit(tr.doc, $from.pos, 1, types)) return false;

	tr.split($from.pos, 1, types).scrollIntoView();
	view.dispatch(tr);
	return true;
}

const TaskKeymap = Extension.create<TaskKeymapOptions>({
	name: 'taskKeymap',
	priority: 200,
	addOptions() {
		return { onEnter: undefined, onEscape: undefined };
	},
	addKeyboardShortcuts() {
		return {
			Enter: () => {
				if (this.options.onEnter?.()) return true;
				return splitAcrossEmptyTail(this.editor);
			},
			Escape: () => this.options.onEscape?.() ?? false
		};
	}
});

export function taskExtensions(options: TaskKeymapOptions = {}) {
	return [
		StarterKit.configure({
			heading: {
				levels: [1, 2, 3]
			},
			blockquote: false,
			codeBlock: false,
			horizontalRule: false,
			trailingNode: false
		}),
		TaskList,
		TaskItem.configure({
			nested: true
		}),
		TaskKeymap.configure(options),
		SearchHighlight
	];
}
