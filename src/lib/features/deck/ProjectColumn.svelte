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
		onAddTask: (projectId: string, group: TaskGroup, content: string) => void;
		onToggleCompleted: (taskId: string) => void;
		onToggleFocus: (taskId: string) => void;
		onUpdateContent: (taskId: string, content: string) => void;
		onDelete: (taskId: string) => void;
	} = $props();

	let editingName = $state(false);
	let nameDraft = $state('');
	let addingTask = $state(false);
	let taskDraft = $state('');
	let menuOpen = $state(false);

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

	function addTask() {
		const content = taskDraft.trim();
		if (!content) return;
		onAddTask(project.id, 'other', content);
		taskDraft = '';
		addingTask = false;
	}

	function onTaskDraftKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			addTask();
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			taskDraft = '';
			addingTask = false;
		}
	}
</script>

<article class="group grid max-h-full w-80 flex-[0_0_20rem] grid-rows-[auto_1fr] overflow-hidden">
	<header class="flex items-center justify-between gap-2 px-0.5 pt-1.5 pb-2.5">
		<div class="flex min-w-0 items-center gap-1.5">
			{#if editingName}
				<input
					class="w-full min-w-0 rounded-lg border border-[#007aff] bg-white px-1.5 py-1 font-semibold outline-none"
					bind:value={nameDraft}
					onkeydown={onNameKeydown}
					onblur={saveName}
				/>
			{:else}
				<button
					class="min-w-0 border-0 bg-transparent text-left text-[0.98rem] font-semibold tracking-[-0.015em]"
					onclick={() => (editingName = true)}>{project.name}</button
				>
			{/if}

			<button
				class="grid size-[1.35rem] place-items-center rounded-full border-0 bg-transparent text-base text-[#8a8a91] opacity-0 transition group-hover:opacity-100 hover:bg-black/5 focus-visible:opacity-100"
				aria-label="Add task"
				onclick={() => (addingTask = true)}>+</button
			>
		</div>

		<div class="relative">
			<button
				class="grid size-[1.35rem] place-items-center rounded-[0.42rem] border-0 bg-transparent text-[0.76rem] text-[#8a8a91] opacity-0 transition group-hover:opacity-100 hover:bg-black/5 focus-visible:opacity-100 aria-expanded:bg-black/5 aria-expanded:opacity-100"
				aria-label="Project menu"
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				⌘
			</button>

			{#if menuOpen}
				<div
					class="absolute top-[calc(100%+0.35rem)] right-0 z-10 min-w-32 rounded-[0.65rem] border border-black/10 bg-white/94 p-1 shadow-[0_8px_24px_rgb(0_0_0_/_0.12)] backdrop-blur-lg"
				>
					<button
						class="w-full rounded-md border-0 bg-transparent px-2 py-1.5 text-left text-[0.82rem] text-[#1d1d1f] hover:bg-black/5"
						onclick={() => {
							onArchiveProject(project.id);
							menuOpen = false;
						}}
					>
						Archive
					</button>
				</div>
			{/if}
		</div>
	</header>

	<div class="[scrollbar-width:thin] overflow-y-auto pt-4 pb-3">
		{#if addingTask}
			<textarea
				class="mt-1 mb-2 min-h-12 w-full resize-y rounded-lg border border-[#007aff] bg-white px-2 py-1.5 text-[0.88rem] leading-snug outline-none"
				bind:value={taskDraft}
				placeholder="New task…"
				onkeydown={onTaskDraftKeydown}
				onblur={addTask}
			></textarea>
		{/if}

		<div class="grid min-h-1 gap-3">
			{#each activeTasks as task (task.id)}
				<TaskItem {task} {onToggleCompleted} {onToggleFocus} {onUpdateContent} {onDelete} />
			{/each}
		</div>

		<section class="mt-4">
			<button
				class="flex w-full items-center gap-1.5 rounded-lg border-0 bg-transparent px-1 py-1.5 text-left text-xs font-semibold text-[#9a9aa0] hover:bg-black/4"
				onclick={() => onToggleCompletedExpanded(project.id)}
			>
				<span>{project.completedExpanded ? '⌄' : '›'}</span>
				Archive
				<span class="ml-auto font-medium text-[#b0b0b6]">{archivedTasks.length}</span>
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
