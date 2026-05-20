<script lang="ts">
	import TaskItem from './TaskItem.svelte';
	import type { Project, Task, TaskGroup } from './types';

	let {
		project,
		activeTasks,
		archivedTasks,
		completedCount,
		onRenameProject,
		onArchiveProject,
		onToggleCompletedExpanded,
		onArchiveCompleted,
		onAddTask,
		onToggleCompleted,
		onToggleFocus,
		onUpdateContent,
		onDelete
	}: {
		project: Project;
		activeTasks: Task[];
		archivedTasks: Task[];
		completedCount: number;
		onRenameProject: (projectId: string, name: string) => void;
		onArchiveProject: (projectId: string) => void;
		onToggleCompletedExpanded: (projectId: string) => void;
		onArchiveCompleted: (projectId: string) => void;
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

<article class="project-column">
	<header class="project-header">
		<div class="project-title-row">
			{#if editingName}
				<input
					class="project-name-input"
					bind:value={nameDraft}
					onkeydown={onNameKeydown}
					onblur={saveName}
				/>
			{:else}
				<button class="project-title" onclick={() => (editingName = true)}>{project.name}</button>
			{/if}

			<button class="project-add-task" aria-label="Add task" onclick={() => (addingTask = true)}
				>+</button
			>
		</div>

		<div class="project-menu-wrap">
			<button
				class="project-menu"
				aria-label="Project menu"
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				⌘
			</button>

			{#if menuOpen}
				<div class="project-menu-popover">
					<button
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

	<div class="project-scroll">
		{#if addingTask}
			<textarea
				class="new-task-input project-new-task"
				bind:value={taskDraft}
				placeholder="New task…"
				onkeydown={onTaskDraftKeydown}
				onblur={addTask}
			></textarea>
		{/if}

		<div class="task-list active-task-list">
			{#each activeTasks as task (task.id)}
				<TaskItem {task} {onToggleCompleted} {onToggleFocus} {onUpdateContent} {onDelete} />
			{/each}
		</div>

		<section class="completed-section">
			<div class="archive-header">
				<button class="completed-toggle" onclick={() => onToggleCompletedExpanded(project.id)}>
					<span>{project.completedExpanded ? '⌄' : '›'}</span>
					Archive
					<span class="completed-count">{archivedTasks.length}</span>
				</button>

				{#if completedCount > 0}
					<button class="archive-completed-button" onclick={() => onArchiveCompleted(project.id)}>
						Archive done
					</button>
				{/if}
			</div>

			{#if project.completedExpanded}
				<div class="task-list completed-list">
					{#each archivedTasks as task (task.id)}
						<TaskItem {task} {onToggleCompleted} {onToggleFocus} {onUpdateContent} {onDelete} />
					{/each}
				</div>
			{/if}
		</section>
	</div>
</article>
