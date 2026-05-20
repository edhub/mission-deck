<script lang="ts">
	import TaskGroupSection from './TaskGroup.svelte';
	import TaskItem from './TaskItem.svelte';
	import { TASK_GROUPS, type Project, type Task, type TaskGroup } from './types';

	let {
		project,
		tasksByGroup,
		completedTasks,
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
		tasksByGroup: Record<TaskGroup, Task[]>;
		completedTasks: Task[];
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
</script>

<article class="project-column">
	<header class="project-header">
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

		<button
			class="project-menu"
			aria-label="Archive project"
			onclick={() => onArchiveProject(project.id)}
		>
			Archive
		</button>
	</header>

	<div class="project-scroll">
		{#each TASK_GROUPS as group (group)}
			<TaskGroupSection
				projectId={project.id}
				{group}
				tasks={tasksByGroup[group]}
				{onAddTask}
				{onToggleCompleted}
				{onToggleFocus}
				{onUpdateContent}
				{onDelete}
			/>
		{/each}

		<section class="completed-section">
			<button class="completed-toggle" onclick={() => onToggleCompletedExpanded(project.id)}>
				<span>{project.completedExpanded ? '⌄' : '›'}</span>
				Completed
				<span class="completed-count">{completedTasks.length}</span>
			</button>

			{#if project.completedExpanded}
				<div class="task-list completed-list">
					{#each completedTasks as task (task.id)}
						<TaskItem {task} {onToggleCompleted} {onToggleFocus} {onUpdateContent} {onDelete} />
					{/each}
				</div>
			{/if}
		</section>
	</div>
</article>
