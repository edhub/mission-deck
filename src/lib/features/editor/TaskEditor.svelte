<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import { taskExtensions } from './extensions';
	import { isEmptyHtml, normalizeContent } from './content';

	let {
		content,
		editable = true,
		onChange,
		onFocus,
		onBlur
	}: {
		content: string;
		editable?: boolean;
		onChange?: (html: string) => void;
		onFocus?: () => void;
		onBlur?: () => void;
	} = $props();

	let host: HTMLDivElement | undefined = $state();
	let editor: Editor | undefined = $state();
	let baseline = '';

	function commit() {
		if (!editor) return;
		const html = editor.getHTML();
		if (isEmptyHtml(html)) {
			editor.commands.setContent(baseline, { emitUpdate: false });
			return;
		}
		if (html === baseline) return;
		baseline = html;
		onChange?.(html);
	}

	function cancel() {
		if (!editor) return;
		editor.commands.setContent(baseline, { emitUpdate: false });
		editor.commands.blur();
	}

	function mount(element: HTMLDivElement) {
		baseline = normalizeContent(content);
		const instance = new Editor({
			element,
			editable,
			extensions: taskExtensions({
				onEnter: () => {
					instance.commands.blur();
					return true;
				},
				onEscape: () => {
					cancel();
					return true;
				}
			}),
			content: baseline,
			editorProps: {
				attributes: {
					class: 'task-editor-surface'
				}
			},
			onFocus: () => onFocus?.(),
			onBlur: () => {
				commit();
				onBlur?.();
			}
		});
		editor = instance;
	}

	$effect(() => {
		if (host && !editor) mount(host);
	});

	$effect(() => {
		if (!editor) return;
		const next = normalizeContent(content);
		if (editor.isFocused) return;
		if (next === editor.getHTML()) return;
		baseline = next;
		editor.commands.setContent(next, { emitUpdate: false });
	});

	$effect(() => {
		if (!editor) return;
		if (editor.isEditable !== editable) editor.setEditable(editable);
	});

	onDestroy(() => {
		editor?.destroy();
		editor = undefined;
	});
</script>

<div bind:this={host} class="task-editor-host"></div>

<style>
	.task-editor-host {
		display: contents;
	}

	.task-editor-host :global(.task-editor-surface) {
		min-width: 0;
		outline: none;
		color: inherit;
		font-size: 0.88rem;
		line-height: 1.4;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.task-editor-host :global(.task-editor-surface p) {
		margin: 0;
	}

	.task-editor-host :global(.task-editor-surface p + p) {
		margin-top: 0.25rem;
	}

	.task-editor-host :global(.task-editor-surface code) {
		padding: 0.05em 0.3em;
		border-radius: 0.3rem;
		background: rgb(0 0 0 / 6%);
		font-family:
			ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
		font-size: 0.82em;
	}

	.task-editor-host :global(.task-editor-surface a) {
		color: #007aff;
		text-decoration: underline;
	}
</style>
