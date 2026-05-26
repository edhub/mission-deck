<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import { taskExtensions } from './extensions';
	import { normalizeContent, sanitizeTiptapHtml, type EditorDefaultTag } from './content';
	import { setSearchHighlight } from './searchHighlight';

	let {
		content,
		editable = true,
		onChange,
		onFocus,
		onBlur,
		autofocus = false,
		onAutofocused,
		surfaceClass = '',
		defaultTag = 'p',
		muted = false,
		highlight = ''
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
		muted?: boolean;
		highlight?: string;
	} = $props();

	let host: HTMLDivElement | undefined = $state();
	let editor: Editor | undefined = $state();
	let baseline = '';
	let didAutofocus = false;

	const sanitizedContent = $derived(editable ? '' : sanitizeTiptapHtml(content));

	function commit() {
		if (!editor) return;
		const html = editor.getHTML();
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
					class: ['task-content', surfaceClass].filter(Boolean).join(' ')
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
		if (!editor) return;
		const dom = editor.view.dom;
		if (muted) dom.classList.add('is-muted');
		else dom.classList.remove('is-muted');
	});

	$effect(() => {
		if (editable && host && !editor) mount(host);
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
		if (!editor) return;
		setSearchHighlight(editor, highlight);
	});

	$effect(() => {
		if (!editor || !autofocus || didAutofocus) return;
		didAutofocus = true;
		requestAnimationFrame(() => {
			editor?.commands.focus('end');
			onAutofocused?.();
		});
	});

	onDestroy(() => {
		if (editor?.isFocused) editor.commands.blur();
		editor?.destroy();
		editor = undefined;
	});
</script>

{#if editable}
	<div bind:this={host} class="contents"></div>
{:else}
	<div class={['task-content', surfaceClass, muted && 'is-muted']}>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html sanitizedContent}
	</div>
{/if}
