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

<div class="app-shell">
	<header class="topbar">
		<div>
			<p class="eyebrow">Local deck</p>
			<h1>Mission Deck</h1>
		</div>

		<div class="topbar-actions">
			{#if deck.hasCompletedTasks}
				<button class="toolbar-button" onclick={() => deck.archiveAllCompletedTasks()}>
					Archive done
				</button>
			{/if}
			<button class="toolbar-button" onclick={() => deck.exportDeck()}>Export</button>
			<button class="primary-button" onclick={() => deck.addProject()}>+ Project</button>
		</div>
	</header>

	{#if !deck.loaded}
		<main class="loading-state">Loading your deck…</main>
	{:else}
		<main class="deck-viewport" aria-label="Mission deck projects">
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
