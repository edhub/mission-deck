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
	class="relative grid h-screen grid-rows-[auto_1fr] overflow-hidden bg-linear-to-b from-[#fbfbfd] to-[#f1f1f3] before:pointer-events-none before:absolute before:top-0 before:left-0 before:size-[32rem] before:bg-radial-[at_top_left] before:from-white/90 before:to-transparent"
>
	<header
		class="z-10 flex items-center justify-between gap-4 border-b border-black/8 bg-white/68 px-5 pt-3.5 pb-3 backdrop-blur-2xl"
	>
		<div>
			<p class="mb-0.5 text-[0.72rem] font-semibold tracking-[0.05em] text-[#8a8a91] uppercase">
				Local deck
			</p>
			<h1 class="m-0 text-[1.15rem] font-semibold tracking-[-0.02em]">Mission Deck</h1>
		</div>

		<div class="flex gap-2">
			{#if deck.hasCompletedTasks}
				<button
					class="rounded-[0.55rem] border border-black/10 bg-white/75 px-3 py-1.5 text-[0.85rem] text-[#2c2c2e]"
					onclick={() => deck.archiveAllCompletedTasks()}
				>
					Archive done
				</button>
			{/if}
			<button
				class="rounded-[0.55rem] border border-black/10 bg-white/75 px-3 py-1.5 text-[0.85rem] text-[#2c2c2e]"
				onclick={() => deck.exportDeck()}>Export</button
			>
			<button
				class="rounded-[0.55rem] border border-[#007aff] bg-[#007aff] px-3 py-1.5 text-[0.85rem] text-white"
				onclick={() => deck.addProject()}>+ Project</button
			>
		</div>
	</header>

	{#if !deck.loaded}
		<main class="grid place-items-center text-[#6e6e73]">Loading your deck…</main>
	{:else}
		<main
			class="flex [scrollbar-width:thin] gap-[1.15rem] overflow-x-auto overflow-y-hidden px-5 pt-4 pb-5"
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
