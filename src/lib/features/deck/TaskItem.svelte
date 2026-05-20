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

	let editing = $state(false);
	let draft = $state('');

	$effect(() => {
		if (!editing) draft = task.content;
	});

	function startEditing() {
		draft = task.content;
		editing = true;
	}

	function save() {
		onUpdateContent(task.id, draft);
		editing = false;
	}

	function cancel() {
		draft = task.content;
		editing = false;
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			save();
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			cancel();
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

	{#if editing}
		<textarea class="task-editor" bind:value={draft} onkeydown={onKeydown} onblur={save}></textarea>
	{:else}
		<button class="task-content" onclick={startEditing}>
			{task.content}
		</button>
	{/if}

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
