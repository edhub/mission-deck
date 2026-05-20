<script lang="ts">
	import { TaskEditor } from '$lib/features/editor';
	import type { Task } from './types';

	let {
		task,
		onToggleCompleted,
		onToggleFocus,
		onUpdateContent,
		onDelete
	}: {
		task: Task;
		onToggleCompleted: (taskId: string) => void;
		onToggleFocus: (taskId: string) => void;
		onUpdateContent: (taskId: string, content: string) => void;
		onDelete: (taskId: string) => void;
	} = $props();
</script>

<div class:completed={task.completed} class:focused={task.focused} class="task-item group">
	<TaskEditor
		content={task.content}
		editable={!task.completed}
		onChange={(html) => onUpdateContent(task.id, html)}
	/>

	<div class="task-actions">
		<button
			class="task-check"
			aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
			onclick={() => onToggleCompleted(task.id)}
		>
			{task.completed ? '✓' : ''}
		</button>
		<button
			class="task-action focus-action"
			class:active={task.focused}
			aria-label={task.focused ? 'Remove focus' : 'Mark focus'}
			onclick={() => onToggleFocus(task.id)}
		>
			●
		</button>
		<button
			class="task-action danger-action"
			aria-label="Delete task"
			onclick={() => onDelete(task.id)}
		>
			×
		</button>
	</div>
</div>
