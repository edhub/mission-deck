<script lang="ts">
	import { tick } from 'svelte';
	import { TaskEditor } from '$lib/features/editor';
	import type { Task } from './types';

	let {
		task,
		onToggleCompleted,
		onToggleFocus,
		onUpdateContent,
		onDelete,
		autofocus = false,
		onAutofocused
	}: {
		task: Task;
		onToggleCompleted: (taskId: string) => void;
		onToggleFocus: (taskId: string) => void;
		onUpdateContent: (taskId: string, content: string) => void;
		onDelete: (taskId: string) => void;
		autofocus?: boolean;
		onAutofocused?: () => void;
	} = $props();

	let actionButtonEl = $state<HTMLButtonElement>();
	let menuEl = $state<HTMLDivElement>();
	let menuOpen = $state(false);
	let menuLeft = $state(0);
	let menuTop = $state(0);

	function placeMenu() {
		if (!actionButtonEl || !menuEl) return;
		const buttonRect = actionButtonEl.getBoundingClientRect();
		const menuRect = menuEl.getBoundingClientRect();
		const gap = 6;
		const margin = 8;
		const left = Math.min(
			Math.max(margin, buttonRect.right - menuRect.width),
			window.innerWidth - menuRect.width - margin
		);
		const belowTop = buttonRect.bottom + gap;
		const aboveTop = buttonRect.top - menuRect.height - gap;
		const hasRoomBelow = belowTop + menuRect.height <= window.innerHeight - margin;

		menuLeft = left;
		menuTop = hasRoomBelow ? belowTop : Math.max(margin, aboveTop);
	}

	async function toggleTaskMenu() {
		menuOpen = !menuOpen;
		if (!menuOpen) return;
		await tick();
		placeMenu();
	}

	function closeTaskMenu() {
		menuOpen = false;
		actionButtonEl?.blur();
	}

	function toggleCompleted() {
		onToggleCompleted(task.id);
		closeTaskMenu();
	}

	function toggleFocus() {
		onToggleFocus(task.id);
		closeTaskMenu();
	}

	function deleteTask() {
		onDelete(task.id);
		closeTaskMenu();
	}

	function closeOnOutsideClick(event: MouseEvent) {
		const target = event.target as Node;
		if (actionButtonEl?.contains(target) || menuEl?.contains(target)) return;
		closeTaskMenu();
	}

	function closeOnEscape(event: KeyboardEvent) {
		if (event.key === 'Escape') closeTaskMenu();
	}

	$effect(() => {
		if (!menuOpen) return;
		const onScroll = () => closeTaskMenu();
		const onResize = () => placeMenu();
		// capture phase: scroll doesn't bubble, so we need to catch ancestor scroll containers
		window.addEventListener('scroll', onScroll, true);
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('scroll', onScroll, true);
			window.removeEventListener('resize', onResize);
		};
	});
</script>

<svelte:window onclick={closeOnOutsideClick} onkeydown={closeOnEscape} />

<div
	class={[
		'group/task relative block rounded-xl border border-base-content/8 bg-base-100/90 px-3 py-2.5 shadow-sm transition focus-within:z-1 focus-within:border-primary/55 focus-within:bg-base-100 focus-within:shadow-md hover:z-1 hover:border-base-content/12 hover:bg-base-100/96 hover:shadow-md hover:focus-within:border-primary/55',
		task.focused && '!border-warning/35 !bg-warning/5 !shadow-[0_1px_2px_rgb(255_149_0_/_0.08)]',
		task.completed && 'text-base-content/45'
	]}
>
	<div class="min-w-0">
		<TaskEditor
			content={task.content}
			editable={!task.completed}
			muted={task.completed}
			{autofocus}
			{onAutofocused}
			onChange={(html) => onUpdateContent(task.id, html)}
		/>
	</div>

	<button
		bind:this={actionButtonEl}
		class="btn absolute top-2 right-2 z-2 btn-circle text-base-content/40 opacity-0 btn-ghost transition btn-xs group-focus-within/task:opacity-100 group-hover/task:opacity-100 focus-visible:opacity-100"
		aria-label="Task actions"
		onclick={(event) => {
			event.stopPropagation();
			toggleTaskMenu();
		}}
	>
		⋯
	</button>

	{#if menuOpen}
		<div
			bind:this={menuEl}
			class="fixed z-50 w-max rounded-box border border-black/10 bg-base-100/96 p-1 shadow-lg backdrop-blur-lg"
			style={`left: ${menuLeft}px; top: ${menuTop}px;`}
		>
			<ul class="menu w-max menu-sm">
				<li>
					<button class="justify-start whitespace-nowrap" onclick={toggleCompleted}
						>{task.completed ? 'Mark incomplete' : 'Mark complete'}</button
					>
				</li>
				<li>
					<button
						class={[task.focused && 'text-warning', 'justify-start whitespace-nowrap']}
						onclick={toggleFocus}
					>
						{task.focused ? 'Remove focus' : 'Mark focus'}
					</button>
				</li>
				<li>
					<button class="justify-start whitespace-nowrap hover:text-error" onclick={deleteTask}
						>Delete task</button
					>
				</li>
			</ul>
		</div>
	{/if}
</div>
