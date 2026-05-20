<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import { taskExtensions } from './extensions';
	import { isEmptyHtml, normalizeContent, type EditorDefaultTag } from './content';

	let {
		content,
		editable = true,
		onChange,
		onFocus,
		onBlur,
		autofocus = false,
		onAutofocused,
		surfaceClass = '',
		defaultTag = 'p'
	}: {
		content: string;
		editable?: boolean;
		onChange?: (html: string) => void;
		onFocus?: () => void;
		onBlur?: () => void;
		autofocus?: boolean;
		onAutofocused?: () => void;
		surfaceClass?: string;
		defaultTag?: EditorDefaultTag;
	} = $props();

	let host: HTMLDivElement | undefined = $state();
	let editor: Editor | undefined = $state();
	let baseline = '';
	let didAutofocus = false;

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
		baseline = normalizeContent(content, defaultTag);
		const instance = new Editor({
			element,
			editable,
			extensions: taskExtensions({
				onEscape: () => {
					cancel();
					return true;
				}
			}),
			content: baseline,
			editorProps: {
				attributes: {
					class: ['task-editor-surface', surfaceClass].filter(Boolean).join(' ')
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
		const next = normalizeContent(content, defaultTag);
		if (editor.isFocused) return;
		if (next === editor.getHTML()) return;
		baseline = next;
		editor.commands.setContent(next, { emitUpdate: false });
	});

	$effect(() => {
		if (!editor) return;
		if (editor.isEditable !== editable) editor.setEditable(editable);
	});

	$effect(() => {
		if (!editor || !autofocus || didAutofocus) return;
		didAutofocus = true;
		queueMicrotask(() => editor?.commands.focus('end'));
		onAutofocused?.();
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
		box-sizing: border-box;
		min-width: 0;
		outline: none;
		color: inherit;
		font-size: 1rem;
		line-height: 1.4;
		padding-block: 0.125rem;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.task-editor-host :global(.task-editor-surface p) {
		margin: 0;
	}

	.task-editor-host :global(.task-editor-surface p + p) {
		margin-top: 0.25rem;
	}

	.task-editor-host :global(.task-editor-surface h1),
	.task-editor-host :global(.task-editor-surface h2),
	.task-editor-host :global(.task-editor-surface h3) {
		margin: 0;
		font-weight: 650;
		letter-spacing: -0.025em;
		line-height: 1.15;
	}

	.task-editor-host :global(.task-editor-surface h1) {
		font-size: 1.25rem;
	}

	.task-editor-host :global(.task-editor-surface h2) {
		font-size: 1.08rem;
	}

	.task-editor-host :global(.task-editor-surface h3) {
		font-size: 1rem;
	}

	.task-editor-host :global(.task-editor-surface h1 + p),
	.task-editor-host :global(.task-editor-surface h2 + p),
	.task-editor-host :global(.task-editor-surface h3 + p),
	.task-editor-host :global(.task-editor-surface p + h1),
	.task-editor-host :global(.task-editor-surface p + h2),
	.task-editor-host :global(.task-editor-surface p + h3) {
		margin-top: 0.35rem;
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
		color: var(--color-primary);
		text-decoration: underline;
		text-decoration-color: color-mix(in oklch, var(--color-primary) 40%, transparent);
	}
</style>
