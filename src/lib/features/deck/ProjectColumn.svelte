<script lang="ts">
	import { TaskEditor } from '$lib/features/editor';
	import TaskItem from './TaskItem.svelte';
	import type { Project, Task, TaskGroup } from './types';

	let {
		project,
		activeTasks,
		archivedTasks,
		onRenameProject,
		onArchiveProject,
		onToggleCompletedExpanded,
		onAddTask,
		onToggleCompleted,
		onToggleFocus,
		onUpdateContent,
		onDelete
	}: {
		project: Project;
		activeTasks: Task[];
		archivedTasks: Task[];
		onRenameProject: (projectId: string, name: string) => void;
		onArchiveProject: (projectId: string) => void;
		onToggleCompletedExpanded: (projectId: string) => void;
		onAddTask: (projectId: string, group: TaskGroup, content?: string) => Promise<string>;
		onToggleCompleted: (taskId: string) => void;
		onToggleFocus: (taskId: string) => void;
		onUpdateContent: (taskId: string, content: string) => void;
		onDelete: (taskId: string) => void;
	} = $props();

	let autofocusTaskId = $state<string | undefined>();

	async function addTask() {
		autofocusTaskId = await onAddTask(project.id, 'other', '');
	}
</script>

<article class="group relative grid max-h-full w-80 shrink-0 grid-rows-[auto_1fr] overflow-hidden">
	<header class="px-0.5 pt-1.5 pb-2.5">
		<div class="min-w-0">
			<TaskEditor
				content={project.name}
				defaultTag="h1"
				surfaceClass="project-title-editor"
				onChange={(html) => onRenameProject(project.id, html)}
			/>
		</div>

		<button
			class="btn absolute top-1.5 right-7 btn-circle text-base-content/50 opacity-0 btn-ghost transition btn-xs group-hover:opacity-100 focus-visible:opacity-100"
			aria-label="Add task"
			onclick={addTask}>+</button
		>

		<div class="dropdown absolute dropdown-end top-1.5 right-0">
			<button
				class="btn btn-circle text-base-content/50 opacity-0 btn-ghost transition btn-xs group-hover:opacity-100 focus-visible:opacity-100"
				aria-label="Project menu"
			>
				⌘
			</button>

			<ul
				tabindex="-1"
				class="dropdown-content menu z-10 w-36 menu-sm rounded-box border border-black/10 bg-base-100 p-1 shadow-lg backdrop-blur-lg"
			>
				<li>
					<button
						onclick={() => {
							onArchiveProject(project.id);
						}}
					>
						Archive
					</button>
				</li>
			</ul>
		</div>
	</header>

	<div class="[scrollbar-width:thin] overflow-y-auto pt-4 pb-3">
		<div class="grid min-h-1 gap-5">
			{#each activeTasks as task (task.id)}
				<TaskItem
					{task}
					{onToggleCompleted}
					{onToggleFocus}
					{onUpdateContent}
					{onDelete}
					autofocus={task.id === autofocusTaskId}
					onAutofocused={() => (autofocusTaskId = undefined)}
				/>
			{/each}
		</div>

		<section class="mt-4">
			<button
				class="btn btn-block justify-start gap-1.5 font-semibold text-base-content/40 btn-ghost btn-xs"
				onclick={() => onToggleCompletedExpanded(project.id)}
			>
				<span>{project.completedExpanded ? '⌄' : '›'}</span>
				Archive
				<span class="ml-auto font-medium text-base-content/30">{archivedTasks.length}</span>
			</button>

			{#if project.completedExpanded}
				<div class="mt-1 grid gap-3 opacity-78">
					{#each archivedTasks as task (task.id)}
						<TaskItem {task} {onToggleCompleted} {onToggleFocus} {onUpdateContent} {onDelete} />
					{/each}
				</div>
			{/if}
		</section>
	</div>
</article>

<style>
	:global(.project-title-editor) {
		font-size: 1rem;
		padding-block: 0;
		color: color-mix(in oklch, currentColor 78%, transparent);
	}

	:global(.project-title-editor h1),
	:global(.project-title-editor h2),
	:global(.project-title-editor h3) {
		color: var(--color-base-content);
	}
</style>
