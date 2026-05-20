<script lang="ts">
	import { onMount } from 'svelte';
	import ProjectColumn from '$lib/features/deck/ProjectColumn.svelte';
	import { deck } from '$lib/features/deck/state.svelte';
	onMount(() => {
		deck.load();
	});
</script>

<svelte:head>
	<title>Mission Deck</title>
	<meta
		name="description"
		content="A local-first multi-project task deck organized by mode of handling."
	/>
</svelte:head>

<div
	class="relative isolate grid h-screen grid-rows-[auto_1fr] overflow-hidden bg-linear-to-b from-base-100 to-base-300"
>
	<header
		class="navbar relative z-10 border-b border-base-content/8 bg-base-100/68 backdrop-blur-2xl"
	>
		<div class="navbar-start">
			<div>
				<p class="mb-0.5 text-xs font-semibold tracking-wider text-base-content/50 uppercase">
					Local deck
				</p>
				<h1 class="m-0 text-lg font-semibold tracking-tight">Mission Deck</h1>
			</div>
		</div>

		<div class="navbar-end gap-2">
			{#if deck.hasCompletedTasks}
				<button
					class="btn btn-sm btn-ghost"
					onclick={() => deck.archiveAllCompletedTasks()}
				>
					Archive done
				</button>
			{/if}
			<button
				class="btn btn-sm btn-ghost"
				onclick={() => deck.exportDeck()}>Export</button
			>
			<button
				class="btn btn-sm btn-primary"
				onclick={() => deck.addProject()}>+ Project</button
			>
		</div>
	</header>

	{#if !deck.loaded}
		<main class="grid place-items-center text-base-content/60">Loading your deck…</main>
	{:else}
		<main
			class="relative z-10 flex [scrollbar-width:thin] gap-5 overflow-x-auto overflow-y-hidden px-5 pt-4 pb-5"
			aria-label="Mission deck projects"
		>
			{#each deck.activeProjects as project (project.id)}
				<ProjectColumn
					{project}
					activeTasks={deck.activeTasksForProject(project.id)}
					archivedTasks={deck.archivedTasksForProject(project.id)}
					onRenameProject={(projectId, name) => deck.renameProject(projectId, name)}
					onArchiveProject={(projectId) => deck.archiveProject(projectId)}
					onToggleCompletedExpanded={(projectId) => deck.toggleCompletedExpanded(projectId)}
					onAddTask={(projectId, group, content) => deck.addTask(projectId, group, content)}
					onToggleCompleted={(taskId) => deck.toggleTaskCompleted(taskId)}
					onToggleFocus={(taskId) => deck.toggleTaskFocus(taskId)}
					onUpdateContent={(taskId, content) => deck.updateTaskContent(taskId, content)}
					onDelete={(taskId) => deck.deleteTask(taskId)}
				/>
			{/each}
		</main>
	{/if}
</div>
