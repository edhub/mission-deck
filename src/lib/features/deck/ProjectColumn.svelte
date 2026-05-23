<script lang="ts">
	import { dragHandle } from 'svelte-dnd-action';
	import { TaskEditor } from '$lib/features/editor';
	import TaskItem from './TaskItem.svelte';
	import type { Project, Task, TaskTag } from './types';

	let {
		project,
		activeTasks,
		archivedTasks,
		onRenameProject,
		onCompleteProject,
		onDeleteProject,
		onToggleCompletedExpanded,
		onAddTask,
		onToggleCompleted,
		onToggleFlag,
		onUpdateContent,
		onSetTag,
		onDelete
	}: {
		project: Project;
		activeTasks: Task[];
		archivedTasks: Task[];
		onRenameProject: (projectId: string, name: string) => void;
		onCompleteProject: (projectId: string) => void;
		onDeleteProject: (projectId: string) => void;
		onToggleCompletedExpanded: (projectId: string) => void;
		onAddTask: (projectId: string, tag: TaskTag | null, content?: string) => Promise<string>;
		onToggleCompleted: (taskId: string) => void;
		onToggleFlag: (taskId: string) => void;
		onUpdateContent: (taskId: string, content: string) => void;
		onSetTag: (taskId: string, tag: TaskTag | null) => void;
		onDelete: (taskId: string) => void;
	} = $props();

	let autofocusTaskId = $state<string | undefined>();

	async function addTask() {
		autofocusTaskId = await onAddTask(project.id, null, '');
	}
</script>

<article class="group relative h-full max-h-full w-80 shrink-0">
	<div
		class="h-full max-h-full [scrollbar-width:none] overflow-y-auto pt-1.5 pb-40 [&::-webkit-scrollbar]:hidden"
	>
		<header class="relative px-0.5 pb-6">
			<div class="min-w-0">
				<TaskEditor
					content={project.name}
					defaultTag="h1"
					surfaceClass="is-project-title"
					onChange={(html) => onRenameProject(project.id, html)}
				/>
			</div>

			<button
				type="button"
				class="btn absolute top-0 right-14 btn-circle text-base-content/45 opacity-0 btn-ghost transition btn-xs group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
				aria-label="Drag to reorder project"
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

			<button
				class="btn absolute top-0 right-7 btn-circle text-base-content/50 opacity-0 btn-ghost transition btn-xs group-hover:opacity-100 focus-visible:opacity-100"
				aria-label="Add task"
				onclick={addTask}>+</button
			>

			<div class="dropdown absolute dropdown-end top-0 right-0">
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
								onCompleteProject(project.id);
							}}
						>
							Complete project
						</button>
					</li>
					<li>
						<button
							class="text-error"
							onclick={() => {
								if (confirm('Delete this project and all of its tasks?'))
									onDeleteProject(project.id);
							}}
						>
							Delete project
						</button>
					</li>
				</ul>
			</div>
		</header>

		<div class="grid min-h-1 gap-6">
			{#each activeTasks as task (task.id)}
				<TaskItem
					{task}
					{onToggleCompleted}
					{onToggleFlag}
					{onUpdateContent}
					{onSetTag}
					{onDelete}
					autofocus={task.id === autofocusTaskId}
					onAutofocused={() => (autofocusTaskId = undefined)}
				/>
			{/each}
		</div>

		{#if archivedTasks.length > 0}
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
					<div class="mt-4 grid gap-3 opacity-78">
						{#each archivedTasks as task (task.id)}
							<TaskItem
								{task}
								{onToggleCompleted}
								{onToggleFlag}
								{onUpdateContent}
								{onSetTag}
								{onDelete}
								readOnly
							/>
						{/each}
					</div>
				{/if}
			</section>
		{/if}
	</div>
</article>
