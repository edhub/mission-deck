import { Extension, type Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';

export interface TaskKeymapOptions {
	onEnter?: () => boolean;
	onEscape?: () => boolean;
}

function insertParagraphAfterHeading(editor: Editor): boolean {
	const { state, view } = editor;
	const { selection, schema } = state;
	const { $from, empty } = selection;
	const paragraph = schema.nodes.paragraph;

	if (!empty || !paragraph || $from.parent.type.name !== 'heading') return false;
	if ($from.parentOffset !== $from.parent.content.size) return false;

	const insertAt = $from.after();
	const transaction = state.tr.insert(insertAt, paragraph.create());
	transaction.setSelection(TextSelection.create(transaction.doc, insertAt + 1)).scrollIntoView();

	view.dispatch(transaction);
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
			Enter: () => this.options.onEnter?.() ?? insertParagraphAfterHeading(this.editor),
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
			bulletList: false,
			orderedList: false,
			listItem: false,
			blockquote: false,
			codeBlock: false,
			horizontalRule: false,
			trailingNode: false
		}),
		TaskKeymap.configure(options)
	];
}
