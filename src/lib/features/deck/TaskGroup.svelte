<script lang="ts">
	import TaskItem from './TaskItem.svelte';
	import { TASK_GROUP_LABELS, type Task, type TaskGroup } from './types';

	let {
		projectId,
		group,
		tasks,
		onAddTask,
		onToggleCompleted,
		onToggleFocus,
		onUpdateContent,
		onDelete
	}: {
		projectId: string;
		group: TaskGroup;
		tasks: Task[];
		onAddTask: (projectId: string, group: TaskGroup, content: string) => void;
		onToggleCompleted: (taskId: string) => void;
		onToggleFocus: (taskId: string) => void;
		onUpdateContent: (taskId: string, content: string) => void;
		onDelete: (taskId: string) => void;
	} = $props();

	let draft = $state('');
	let adding = $state(false);

	function addTask() {
		const content = draft.trim();
		if (!content) return;
		onAddTask(projectId, group, content);
		draft = '';
		adding = false;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			addTask();
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			draft = '';
			adding = false;
		}
	}
</script>

<section class="task-group">
	<header class="group-header">
		<h3>{TASK_GROUP_LABELS[group]}</h3>
		<button
			class="group-add"
			aria-label={`Add task to ${TASK_GROUP_LABELS[group]}`}
			onclick={() => (adding = true)}
		>
			+
		</button>
	</header>

	<div class="task-list">
		{#each tasks as task (task.id)}
			<TaskItem {task} {onToggleCompleted} {onToggleFocus} {onUpdateContent} {onDelete} />
		{/each}
	</div>

	{#if adding}
		<textarea
			class="new-task-input"
			bind:value={draft}
			placeholder="New task…"
			onkeydown={onKeydown}
			onblur={addTask}
		></textarea>
	{/if}
</section>
