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

	let menuOpen = $state(false);
	let menuWrap: HTMLElement | undefined = $state();

	function closeMenu() {
		menuOpen = false;
	}

	function toggleCompleted() {
		onToggleCompleted(task.id);
		closeMenu();
	}

	function toggleFocus() {
		onToggleFocus(task.id);
		closeMenu();
	}

	function deleteTask() {
		onDelete(task.id);
		closeMenu();
	}

	function onMenuFocusOut(event: FocusEvent) {
		const next = event.relatedTarget;
		if (next instanceof Node && event.currentTarget instanceof HTMLElement) {
			if (event.currentTarget.contains(next)) return;
		}

		closeMenu();
	}

	function onMenuKeydown(event: KeyboardEvent) {
		if (!menuOpen || event.key !== 'Escape') return;
		event.preventDefault();
		closeMenu();
	}

	function onWindowClick(event: MouseEvent) {
		if (!menuOpen) return;
		const target = event.target;
		if (target instanceof Node && menuWrap?.contains(target)) return;
		closeMenu();
	}
</script>

<svelte:window onclick={onWindowClick} onkeydown={onMenuKeydown} />

<div
	class:completed={task.completed}
	class:focused={task.focused}
	class:menu-open={menuOpen}
	class="task-item group"
>
	<TaskEditor
		content={task.content}
		editable={!task.completed}
		onChange={(html) => onUpdateContent(task.id, html)}
	/>

	<div class="task-menu-wrap" bind:this={menuWrap} onfocusout={onMenuFocusOut}>
		<button
			class="task-menu-button"
			aria-label="Task actions"
			aria-expanded={menuOpen}
			onclick={() => (menuOpen = !menuOpen)}
		>
			•••
		</button>

		{#if menuOpen}
			<div class="task-menu-popover" role="menu">
				<button role="menuitem" onclick={toggleCompleted}
					>{task.completed ? 'Mark incomplete' : 'Mark complete'}</button
				>
				<button role="menuitem" class:active={task.focused} onclick={toggleFocus}>
					{task.focused ? 'Remove focus' : 'Mark focus'}
				</button>
				<button role="menuitem" class="danger-action" onclick={deleteTask}>Delete task</button>
			</div>
		{/if}
	</div>
</div>
