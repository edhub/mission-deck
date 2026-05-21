<script lang="ts">
	import { TaskEditor } from '$lib/features/editor';
	import { sanitizeTiptapHtml } from '$lib/features/editor/content';
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
	let sanitizedContent = $derived(sanitizeTiptapHtml(task.content));

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
		// Blur before unmount; relying on TaskEditor.onDestroy's blur leaves focus stuck and breaks the menu on subsequent tasks.
		if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
		onDelete(task.id);
	}
</script>

<div class="task-row relative">
	{#if !readOnly}
		<!-- Action buttons intentionally stay out of the tab order; Tab is reserved for rich-text editing inside the task. -->
		<div
			class={['task-left-action', actionsOpen && 'is-open']}
			aria-hidden={!actionsOpen}
			use:keepEditorFocusRegion
		>
			<button
				class={[
					'task-check-button btn btn-square rounded-full border-0 btn-xs',
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
			<div class="task-flag-corner" aria-hidden="true"></div>
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
			{#if readOnly}
				<div class={['archived-task-content', task.completed && 'is-muted']}>
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html sanitizedContent}
				</div>
			{:else}
				<TaskEditor
					content={task.content}
					editable={true}
					muted={task.completed}
					{autofocus}
					{onAutofocused}
					onFocus={() => (editorFocused = true)}
					onBlur={() => (editorFocused = false)}
					onChange={(html) => onUpdateContent(task.id, html)}
				/>
			{/if}
		</div>
	</div>

	{#if !readOnly}
		<div
			class={['task-menu-panel', actionsOpen && 'is-open']}
			aria-hidden={!actionsOpen}
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

<style>
	.archived-task-content {
		box-sizing: border-box;
		min-width: 0;
		font-size: 1rem;
		line-height: 1.4;
		padding-block: 0.125rem;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.archived-task-content.is-muted {
		text-decoration: line-through;
	}

	.archived-task-content :global(p) {
		margin: 0;
	}

	.archived-task-content :global(p + p) {
		margin-top: 0.25rem;
	}

	.archived-task-content :global(ul),
	.archived-task-content :global(ol) {
		margin: 0.25rem 0 0;
		padding-left: 1.25rem;
	}

	.archived-task-content :global(ul) {
		list-style: disc;
	}

	.archived-task-content :global(ol) {
		list-style: decimal;
	}

	.archived-task-content :global(li) {
		margin: 0.15rem 0;
		padding-left: 0.1rem;
	}

	.archived-task-content :global(li p) {
		margin: 0;
	}

	.archived-task-content :global(h1),
	.archived-task-content :global(h2),
	.archived-task-content :global(h3) {
		margin: 0;
		font-weight: 650;
		letter-spacing: -0.025em;
		line-height: 1.15;
	}

	.archived-task-content :global(h1) {
		font-size: 1.25rem;
	}

	.archived-task-content :global(h2) {
		font-size: 1.08rem;
	}

	.archived-task-content :global(h3) {
		font-size: 1rem;
	}

	.archived-task-content :global(code) {
		padding: 0.05em 0.3em;
		border-radius: 0.3rem;
		background: rgb(0 0 0 / 6%);
		font-family:
			ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
		font-size: 0.82em;
	}

	.archived-task-content :global(a) {
		color: inherit;
		text-decoration: underline;
		text-decoration-color: currentColor;
	}

	.task-flag-corner {
		position: absolute;
		top: 0;
		right: 0;
		width: 1.15rem;
		height: 1.15rem;
		border-top-right-radius: 0.75rem;
		background: color-mix(in oklab, var(--color-warning) 72%, transparent);
		clip-path: polygon(100% 0, 0 0, 100% 100%);
		pointer-events: none;
	}

	.task-left-action,
	.task-menu-panel {
		position: absolute;
		z-index: 50;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 120ms ease-out,
			transform 140ms cubic-bezier(0.2, 0, 0, 1);
	}

	.task-left-action {
		top: 0.65rem;
		right: calc(100% + 0.45rem);
		transform: translateX(0.25rem) scale(0.96);
	}

	.task-check-button {
		box-shadow:
			0 3px 10px rgb(0 0 0 / 10%),
			0 1px 2px rgb(0 0 0 / 10%);
	}

	.task-menu-panel {
		top: 0;
		left: calc(100% + 0.45rem);
		width: fit-content;
		min-width: max-content;
		border: 1px solid color-mix(in oklab, var(--color-base-content) 10%, transparent);
		border-radius: 1rem;
		background: color-mix(in oklab, var(--color-base-100) 94%, transparent);
		padding: 0.35rem;
		box-shadow:
			0 10px 24px rgb(0 0 0 / 10%),
			0 1px 2px rgb(0 0 0 / 8%);
		backdrop-filter: blur(16px);
		transform: translateX(-0.25rem) scale(0.96);
		transform-origin: top left;
	}

	.task-left-action.is-open,
	.task-menu-panel.is-open {
		opacity: 1;
		pointer-events: auto;
		transform: translateX(0) scale(1);
	}

	@media (prefers-reduced-motion: reduce) {
		.task-left-action,
		.task-menu-panel {
			transition: none;
		}
	}
</style>
