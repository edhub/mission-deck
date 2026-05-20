<script lang="ts">
	import { onMount } from 'svelte';
	import ProjectColumn from '$lib/features/deck/ProjectColumn.svelte';
	import { deck } from '$lib/features/deck/state.svelte';
	let sidebarOpen = $state(false);

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

<div class="relative isolate h-screen overflow-hidden bg-linear-to-b from-base-100 to-base-300">
	{#if !deck.loaded}
		<main class="grid h-full place-items-center text-base-content/60">Loading your deck…</main>
	{:else}
		<main
			class="relative z-10 flex h-full [scrollbar-width:thin] gap-8 overflow-x-auto overflow-y-hidden px-5 pt-4 pb-5"
			aria-label="Mission deck projects"
		>
			{#each deck.activeProjects as project, index (project.id)}
				<div class="relative max-h-full shrink-0">
					{#if index > 0}
						<div class="absolute top-3 bottom-3 -left-4 w-px bg-base-content/15"></div>
					{/if}

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
				</div>
			{/each}

			<section class="grid max-h-full w-80 shrink-0 place-items-center px-0.5 pt-10 pb-3">
				<button
					class="group grid h-full min-h-48 w-full place-items-center rounded-3xl border border-dashed border-base-content/12 bg-base-100/24 text-base-content/45 transition hover:border-primary/25 hover:bg-base-100/55 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary/50"
					onclick={() => deck.addProject()}
					aria-label="New project"
				>
					<span class="grid place-items-center gap-3">
						<span
							class="grid size-10 place-items-center rounded-full border border-current/20 bg-base-100/50 text-2xl leading-none transition group-hover:scale-105"
							>+</span
						>
						<span class="text-sm font-semibold">New project</span>
					</span>
				</button>
			</section>
		</main>
	{/if}

	{#if sidebarOpen}
		<button
			class="fixed inset-0 z-30 bg-black/10 backdrop-blur-[1px]"
			aria-label="Close sidebar"
			onclick={() => (sidebarOpen = false)}
		></button>
	{/if}

	<aside
		class={[
			'fixed top-0 bottom-0 left-0 z-40 flex w-72 flex-col border-r border-base-content/10 bg-base-100/88 p-4 shadow-2xl backdrop-blur-2xl transition-transform duration-200',
			sidebarOpen ? 'translate-x-0' : '-translate-x-full'
		]}
		aria-hidden={!sidebarOpen}
	>
		<div class="mb-6 flex items-start justify-between gap-3">
			<div>
				<p class="mb-0.5 text-xs font-semibold tracking-wider text-base-content/45 uppercase">
					Local deck
				</p>
				<h1 class="m-0 text-xl font-semibold tracking-tight">Mission Deck</h1>
			</div>
			<button
				class="btn btn-circle btn-ghost btn-sm"
				aria-label="Close sidebar"
				onclick={() => (sidebarOpen = false)}
			>
				×
			</button>
		</div>

		<nav class="grid gap-1">
			<button class="btn justify-start btn-ghost btn-sm" onclick={() => deck.exportDeck()}>
				Export
			</button>
			{#if deck.hasCompletedTasks}
				<button
					class="btn justify-start btn-ghost btn-sm"
					onclick={() => deck.archiveAllCompletedTasks()}
				>
					Archive done
				</button>
			{/if}
		</nav>
	</aside>

	<button
		class="btn fixed bottom-4 left-4 z-50 btn-circle border border-base-content/10 bg-base-100/82 shadow-lg backdrop-blur-xl btn-sm"
		aria-label="Open sidebar"
		onclick={() => (sidebarOpen = !sidebarOpen)}
	>
		☰
	</button>
</div>
