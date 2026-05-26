<script lang="ts">
	import { flip } from 'svelte/animate';
	import { TRIGGERS, dragHandle, dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import { TaskEditor } from '$lib/features/editor';
	import TaskItem from './TaskItem.svelte';
	import type { Project, Task, TaskTag } from './types';

	let {
		project,
		activeTasks,
		archivedTasks,
		searchActive = false,
		onRenameProject,
		onCompleteProject,
		onDeleteProject,
		onToggleCompletedExpanded,
		onAddTask,
		onMoveTasks,
		onToggleCompleted,
		onToggleFlag,
		onUpdateContent,
		onSetTag,
		onDelete
	}: {
		project: Project;
		activeTasks: Task[];
		archivedTasks: Task[];
		searchActive?: boolean;
		onRenameProject: (projectId: string, name: string) => void;
		onCompleteProject: (projectId: string) => void;
		onDeleteProject: (projectId: string) => void;
		onToggleCompletedExpanded: (projectId: string) => void;
		onAddTask: (projectId: string, tag: TaskTag | null, content?: string) => Promise<string>;
		onMoveTasks: (projectId: string, orderedIds: string[]) => void;
		onToggleCompleted: (taskId: string) => void;
		onToggleFlag: (taskId: string) => void;
		onUpdateContent: (taskId: string, content: string) => void;
		onSetTag: (taskId: string, tag: TaskTag | null) => void;
		onDelete: (taskId: string) => void;
	} = $props();

	let autofocusTaskId = $state<string | undefined>();
	let dragTasks = $state<Task[] | null>(null);
	const taskItems = $derived(dragTasks ?? activeTasks);

	async function addTask() {
		autofocusTaskId = await onAddTask(project.id, null, '');
	}

	function handleTaskConsider(event: CustomEvent<DndEvent<Task>>) {
		// Suppress the library's "snap back to origin" preview when the dragged
		// item is outside every zone — otherwise the source column visibly
		// re-inserts and removes the shadow as the cursor drifts in/out of
		// any task zone.
		if (event.detail.info.trigger === TRIGGERS.DRAGGED_LEFT_ALL) return;
		dragTasks = event.detail.items;
	}

	function handleTaskFinalize(event: CustomEvent<DndEvent<Task>>) {
		// Released outside any zone — treat as cancel; leave deck state untouched.
		// Cross-column cancel (origin receives DROPPED_INTO_ANOTHER) is safe because
		// the library re-inserts the shadow into the origin's items on DRAGGED_LEFT_ALL,
		// so this column's items still represent the original order.
		if (event.detail.info.trigger === TRIGGERS.DROPPED_OUTSIDE_OF_ANY) {
			dragTasks = null;
			return;
		}
		onMoveTasks(
			project.id,
			event.detail.items.map((task) => task.id)
		);
		dragTasks = null;
	}
</script>

<article class="group relative h-full max-h-full w-80 shrink-0">
	<div
		class="-mx-8 h-full max-h-full [scrollbar-width:none] overflow-y-auto px-8 pt-1.5 pb-40 [&::-webkit-scrollbar]:hidden"
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
				class="btn absolute top-0 right-7 btn-circle text-base-content/45 opacity-0 btn-ghost transition btn-xs group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
				aria-label="Drag to reorder project"
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

		<div
			class="grid min-h-1 gap-6"
			use:dragHandleZone={{
				items: taskItems,
				flipDurationMs: 180,
				type: 'task',
				dropTargetStyle: {},
				zoneTabIndex: -1,
				zoneItemTabIndex: -1,
				dragDisabled: searchActive
			}}
			onconsider={handleTaskConsider}
			onfinalize={handleTaskFinalize}
		>
			{#each taskItems as task (task.id)}
				<div animate:flip={{ duration: 180 }}>
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
				</div>
			{/each}
		</div>

		{#if !searchActive}
			<button
				type="button"
				class="btn mt-4 w-full justify-start border-dashed text-base-content/40 opacity-0 btn-ghost transition btn-sm group-hover:opacity-100 focus-visible:opacity-100"
				aria-label="Add task"
				onclick={addTask}
			>
				+ Add task
			</button>
		{/if}

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
