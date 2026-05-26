<script lang="ts">
	import { dragHandle } from 'svelte-dnd-action';
	import { TaskEditor } from '$lib/features/editor';
	import { floating } from '$lib/actions/floating';
	import { portal } from '$lib/actions/portal';
	import { TASK_TAG_ACCENTS, TASK_TAG_LABELS, TASK_TAGS, type Task, type TaskTag } from './types';

	let {
		task,
		onToggleCompleted,
		onToggleFlag,
		onUpdateContent,
		onSetTag,
		onDelete,
		autofocus = false,
		onAutofocused,
		readOnly = false
	}: {
		task: Task;
		onToggleCompleted: (taskId: string) => void;
		onToggleFlag: (taskId: string) => void;
		onUpdateContent: (taskId: string, content: string) => void;
		onSetTag: (taskId: string, tag: TaskTag | null) => void;
		onDelete: (taskId: string) => void;
		autofocus?: boolean;
		onAutofocused?: () => void;
		readOnly?: boolean;
	} = $props();

	let editorFocused = $state(false);
	let actionsOpen = $derived(editorFocused && !readOnly);
	let taskRow = $state<HTMLElement | null>(null);

	const GAP = 7.2;

	function positionLeft(rect: DOMRect) {
		return { top: rect.top + 10, right: window.innerWidth - rect.left + GAP };
	}

	function positionRight(rect: DOMRect) {
		return { top: rect.top, left: rect.right + GAP };
	}

	function keepEditorFocusRegion(node: HTMLElement) {
		const keepFocus = (event: MouseEvent) => event.preventDefault();
		node.addEventListener('mousedown', keepFocus);
		return {
			destroy() {
				node.removeEventListener('mousedown', keepFocus);
			}
		};
	}

	function toggleCompleted() {
		onToggleCompleted(task.id);
	}

	function toggleFlag() {
		onToggleFlag(task.id);
	}

	function setTag(tag: TaskTag) {
		onSetTag(task.id, task.tag === tag ? null : tag);
	}

	function deleteTask() {
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		onDelete(task.id);
	}
</script>

<div bind:this={taskRow}>
	{#if !readOnly}
		<div
			class={[
				'pointer-events-none z-50 translate-x-1 scale-96 opacity-0 transition duration-150 ease-out',
				actionsOpen && '!pointer-events-auto !translate-x-0 !scale-100 !opacity-100'
			]}
			aria-hidden={!actionsOpen}
			use:portal
			use:floating={{ reference: taskRow, position: positionLeft }}
			use:keepEditorFocusRegion
		>
			<button
				class={[
					'btn btn-square rounded-full border-0 shadow-[0_3px_10px_rgb(0_0_0/10%),0_1px_2px_rgb(0_0_0/10%)] btn-xs',
					task.completed
						? 'bg-base-content/45 text-base-100 hover:bg-base-content/55'
						: 'bg-base-100 text-base-content/70 hover:bg-base-200'
				]}
				tabindex="-1"
				aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
				title={task.completed ? 'Mark incomplete' : 'Mark complete'}
				onclick={toggleCompleted}
			>
				✓
			</button>
		</div>
	{/if}

	<div
		class={[
			'group/task relative block rounded-xl border border-base-content/8 bg-base-100/90 px-3 py-2.5 shadow-sm transition focus-within:z-1 focus-within:border-base-content/12 focus-within:bg-base-100 focus-within:shadow-md hover:z-1 hover:border-base-content/12 hover:bg-base-100/96 hover:shadow-md',
			task.completed && 'text-base-content/45'
		]}
	>
		{#if task.flagged && !task.completed}
			<div
				class="pointer-events-none absolute top-0 right-0 size-[1.15rem] rounded-tr-xl bg-warning/72 [clip-path:polygon(100%_0,0_0,100%_100%)]"
				aria-hidden="true"
			></div>
		{/if}

		{#if !readOnly}
			<button
				type="button"
				class={[
					'btn absolute top-1 right-1 z-1 btn-circle text-base-content/40 opacity-0 transition btn-xs group-hover/task:opacity-100 focus-visible:opacity-100 active:cursor-grabbing',
					task.flagged && !task.completed
						? 'border-0 bg-base-100/95 hover:bg-base-200'
						: 'btn-ghost'
				]}
				aria-label="Drag to reorder task"
				tabindex="-1"
				use:dragHandle
			>
				<svg viewBox="0 0 8 12" class="size-3" aria-hidden="true">
					<g fill="currentColor">
						<circle cx="2" cy="2" r="1" />
						<circle cx="2" cy="6" r="1" />
						<circle cx="2" cy="10" r="1" />
						<circle cx="6" cy="2" r="1" />
						<circle cx="6" cy="6" r="1" />
						<circle cx="6" cy="10" r="1" />
					</g>
				</svg>
			</button>
		{/if}

		{#if task.tag}
			<div
				class={['absolute inset-y-2 left-0 w-0.5 rounded-full', TASK_TAG_ACCENTS[task.tag]]}
				aria-hidden="true"
			></div>

			<div
				class="absolute -top-2 left-3 rounded-full bg-base-100 px-1 text-[0.64rem] leading-none font-medium tracking-wide text-base-content/40 transition group-focus-within/task:text-base-content/55 group-hover/task:text-base-content/55"
			>
				{TASK_TAG_LABELS[task.tag]}
			</div>
		{/if}

		<div class="min-w-0">
			<TaskEditor
				content={task.content}
				editable={!readOnly}
				muted={task.completed}
				{autofocus}
				{onAutofocused}
				onFocus={() => (editorFocused = true)}
				onBlur={() => (editorFocused = false)}
				onChange={(html) => onUpdateContent(task.id, html)}
			/>
		</div>
	</div>

	{#if !readOnly}
		<div
			class={[
				'pointer-events-none z-50 w-fit min-w-max origin-top-left -translate-x-1 scale-96 rounded-2xl border border-base-content/10 bg-base-100/94 p-1.5 opacity-0 shadow-[0_10px_24px_rgb(0_0_0/10%),0_1px_2px_rgb(0_0_0/8%)] backdrop-blur-lg transition duration-150 ease-out',
				actionsOpen && '!pointer-events-auto !translate-x-0 !scale-100 !opacity-100'
			]}
			aria-hidden={!actionsOpen}
			use:portal
			use:floating={{ reference: taskRow, position: positionRight }}
			use:keepEditorFocusRegion
		>
			<div class="flex items-center gap-1 border-b border-base-content/8 px-1 pb-1">
				<button
					class={[task.flagged && 'text-warning', 'btn btn-square rounded-full btn-ghost btn-xs']}
					tabindex="-1"
					aria-label={task.flagged ? 'Unflag task' : 'Flag task'}
					title={task.flagged ? 'Unflag task' : 'Flag task'}
					onclick={toggleFlag}
				>
					★
				</button>
				<button
					class="btn btn-square rounded-full text-error/75 btn-ghost btn-xs hover:text-error"
					tabindex="-1"
					aria-label="Delete task"
					title="Delete task"
					onclick={deleteTask}
				>
					×
				</button>
			</div>

			<div class="grid gap-0.5 pt-1">
				{#each TASK_TAGS as tag (tag)}
					<button
						class={[
							'btn h-6 min-h-6 justify-start rounded-lg px-2 text-xs font-medium whitespace-nowrap btn-ghost',
							tag === task.tag && 'bg-primary/10 text-primary'
						]}
						tabindex="-1"
						onclick={() => setTag(tag)}
					>
						{TASK_TAG_LABELS[tag]}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
