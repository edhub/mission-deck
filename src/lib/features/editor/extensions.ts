import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

export interface TaskKeymapOptions {
	onEnter?: () => boolean;
	onEscape?: () => boolean;
}

const TaskKeymap = Extension.create<TaskKeymapOptions>({
	name: 'taskKeymap',
	priority: 200,
	addOptions() {
		return { onEnter: undefined, onEscape: undefined };
	},
	addKeyboardShortcuts() {
		return {
			Enter: () => this.options.onEnter?.() ?? false,
			Escape: () => this.options.onEscape?.() ?? false
		};
	}
});

export function taskExtensions(options: TaskKeymapOptions = {}) {
	return [
		StarterKit.configure({
			heading: false,
			bulletList: false,
			orderedList: false,
			listItem: false,
			blockquote: false,
			codeBlock: false,
			horizontalRule: false
		}),
		TaskKeymap.configure(options)
	];
}
