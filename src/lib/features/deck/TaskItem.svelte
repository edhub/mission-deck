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
	class={[
		'group relative block rounded-xl border border-black/8 bg-white/90 px-3 py-2.5 shadow-[0_1px_2px_rgb(0_0_0_/_0.04)] transition focus-within:z-1 focus-within:border-[#007aff]/55 focus-within:bg-white focus-within:shadow-[0_1px_2px_rgb(0_0_0_/_0.04)] hover:z-1 hover:border-black/12 hover:bg-white/96 hover:shadow-[0_2px_6px_rgb(0_0_0_/_0.05)] [&_.task-editor-surface]:pr-7',
		menuOpen && 'z-20',
		task.focused && 'border-[#ff9500]/28 bg-[#fffaf2]/96',
		task.completed && '[&_.task-editor-surface]:text-[#8a8a91] [&_.task-editor-surface]:line-through'
	]}
>
	<TaskEditor
		content={task.content}
		editable={!task.completed}
		onChange={(html) => onUpdateContent(task.id, html)}
	/>

	<div class="absolute top-1.5 right-2 z-2" bind:this={menuWrap} onfocusout={onMenuFocusOut}>
		<button
			class="grid size-[1.35rem] place-items-center rounded-full border-0 bg-white/74 text-[0.5rem] leading-none tracking-[-0.08em] text-[#9a9aa0] opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-black/5 hover:text-[#6e6e73] focus-visible:opacity-100 aria-expanded:bg-black/5 aria-expanded:text-[#6e6e73] aria-expanded:opacity-100"
			aria-label="Task actions"
			aria-expanded={menuOpen}
			onclick={() => (menuOpen = !menuOpen)}
		>
			•••
		</button>

		{#if menuOpen}
			<div
				class="absolute top-[calc(100%+0.25rem)] right-0 z-3 min-w-36 rounded-[0.65rem] border border-black/10 bg-white/96 p-1 shadow-[0_8px_24px_rgb(0_0_0_/_0.12)] backdrop-blur-lg"
				role="menu"
			>
				<button
					class="w-full rounded-md border-0 bg-transparent px-2 py-1.5 text-left text-[0.82rem] text-[#1d1d1f] hover:bg-black/5"
					role="menuitem"
					onclick={toggleCompleted}>{task.completed ? 'Mark incomplete' : 'Mark complete'}</button
				>
				<button
					class={[
						'w-full rounded-md border-0 bg-transparent px-2 py-1.5 text-left text-[0.82rem] text-[#1d1d1f] hover:bg-black/5',
						task.focused && 'bg-black/5 text-[#ff9500]'
					]}
					role="menuitem"
					onclick={toggleFocus}
				>
					{task.focused ? 'Remove focus' : 'Mark focus'}
				</button>
				<button
					role="menuitem"
					class="w-full rounded-md border-0 bg-transparent px-2 py-1.5 text-left text-[0.82rem] text-[#1d1d1f] hover:border-[#ff3b30]/35 hover:bg-black/5 hover:text-[#ff3b30]"
					onclick={deleteTask}>Delete task</button
				>
			</div>
		{/if}
	</div>
</div>
