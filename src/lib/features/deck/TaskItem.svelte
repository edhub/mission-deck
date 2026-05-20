<script lang="ts">
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

	let taskActionsEl: HTMLDivElement;

	function closeTaskMenu() {
		taskActionsEl?.querySelectorAll<HTMLElement>(':focus').forEach((element) => element.blur());
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
</script>

<div
	class={[
		'group/task relative block rounded-xl border border-base-content/8 bg-base-100/90 px-3 py-2.5 shadow-sm transition hover:z-1 hover:border-base-content/12 hover:bg-base-100/96 hover:shadow-md focus-within:z-1 focus-within:border-primary/55 focus-within:bg-base-100 focus-within:shadow-md hover:focus-within:border-primary/55',
		task.focused &&
			'!border-warning/35 !bg-warning/5 !shadow-[0_1px_2px_rgb(255_149_0_/_0.08)]',
		task.completed &&
			'[&_.task-editor-surface]:text-base-content/50 [&_.task-editor-surface]:line-through'
	]}
>
	<div class="min-w-0">
		<TaskEditor
			content={task.content}
			defaultTag="h3"
			editable={!task.completed}
			{autofocus}
			{onAutofocused}
			onChange={(html) => onUpdateContent(task.id, html)}
		/>
	</div>

	<div class="dropdown dropdown-end absolute right-2 top-2 z-2" bind:this={taskActionsEl}>
		<button
			class="btn btn-ghost btn-xs btn-circle text-base-content/40 opacity-0 transition group-focus-within/task:opacity-100 group-hover/task:opacity-100 focus-visible:opacity-100"
			aria-label="Task actions"
		>
			⋯
		</button>

		<ul
			tabindex="-1"
			class="dropdown-content menu menu-sm bg-base-100/96 rounded-box z-3 w-40 p-1 shadow-lg border border-black/10 backdrop-blur-lg"
		>
			<li>
				<button onclick={toggleCompleted}
					>{task.completed ? 'Mark incomplete' : 'Mark complete'}</button
				>
			</li>
			<li>
				<button class={task.focused ? 'text-warning' : ''} onclick={toggleFocus}>
					{task.focused ? 'Remove focus' : 'Mark focus'}
				</button>
			</li>
			<li>
				<button class="hover:text-error" onclick={deleteTask}>Delete task</button>
			</li>
		</ul>
	</div>
</div>
