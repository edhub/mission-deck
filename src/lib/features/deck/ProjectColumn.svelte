<script lang="ts">
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

	let editingName = $state(false);
	let nameDraft = $state('');
	let autofocusTaskId = $state<string | undefined>();

	$effect(() => {
		if (!editingName) nameDraft = project.name;
	});

	function saveName() {
		onRenameProject(project.id, nameDraft);
		editingName = false;
	}

	function cancelName() {
		nameDraft = project.name;
		editingName = false;
	}

	function onNameKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') saveName();
		if (event.key === 'Escape') cancelName();
	}

	async function addTask() {
		autofocusTaskId = await onAddTask(project.id, 'other', '');
	}
</script>

<article class="group grid max-h-full w-80 shrink-0 grid-rows-[auto_1fr] overflow-hidden">
	<header class="flex items-center justify-between gap-2 px-0.5 pt-1.5 pb-2.5">
		<div class="flex min-w-0 items-center gap-1.5">
			{#if editingName}
				<input
					class="input input-sm input-bordered w-full min-w-0 font-semibold"
					bind:value={nameDraft}
					onkeydown={onNameKeydown}
					onblur={saveName}
				/>
			{:else}
				<button
					class="btn btn-ghost btn-sm min-w-0 text-base font-semibold tracking-tight"
					onclick={() => (editingName = true)}>{project.name}</button
				>
			{/if}

			<button
				class="btn btn-ghost btn-xs btn-circle text-base-content/50 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
				aria-label="Add task"
				onclick={addTask}>+</button
			>
		</div>

		<div class="dropdown dropdown-end">
			<button
				class="btn btn-ghost btn-xs btn-circle text-base-content/50 opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
				aria-label="Project menu"
			>
				⌘
			</button>

			<ul tabindex="-1" class="dropdown-content menu menu-sm bg-base-100 rounded-box z-10 w-36 p-1 shadow-lg border border-black/10 backdrop-blur-lg">
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
		<div class="grid min-h-1 gap-3">
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
				class="btn btn-ghost btn-xs btn-block justify-start gap-1.5 font-semibold text-base-content/40"
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
