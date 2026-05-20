<script lang="ts">
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

	let draft = $derived(task.content);

	function save() {
		const content = draft.trim();
		if (content && content !== task.content) onUpdateContent(task.id, content);
		if (!content) draft = task.content;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			save();
			(event.currentTarget as HTMLTextAreaElement).blur();
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			draft = task.content;
			(event.currentTarget as HTMLTextAreaElement).blur();
		}
	}
</script>

<div class:completed={task.completed} class:focused={task.focused} class="task-item group">
	<button
		class="task-check"
		aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
		onclick={() => onToggleCompleted(task.id)}
	>
		{task.completed ? '✓' : ''}
	</button>

	<textarea
		class="task-editor inline-task-editor"
		aria-label="Task content"
		bind:value={draft}
		onkeydown={onKeydown}
		onblur={save}
	></textarea>

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
