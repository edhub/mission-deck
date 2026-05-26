<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { flip } from 'svelte/animate';
	import { dragHandleZone, type DndEvent } from 'svelte-dnd-action';
	import ProjectColumn from '$lib/features/deck/ProjectColumn.svelte';
	import { deck } from '$lib/features/deck/state.svelte';
	import SearchOverlay from '$lib/features/search/SearchOverlay.svelte';
	import SearchChip from '$lib/features/search/SearchChip.svelte';
	import { isImeEvent, search } from '$lib/features/search/state.svelte';
	import { getShelfToken, setShelfToken } from '$lib/features/sync/session';
	import SyncPanel from '$lib/features/sync/SyncPanel.svelte';
	import type { Project, Task } from '$lib/features/deck/types';

	let sidebarOpen = $state(false);
	let dragItems = $state<Project[] | null>(null);
	let importInput = $state<HTMLInputElement>();
	const filteredActive = $derived.by(() => {
		const map = new SvelteMap<string, Task[]>();
		for (const project of deck.activeProjects) {
			const tasks = deck.activeTasksForProject(project.id);
			map.set(
				project.id,
				search.active ? tasks.filter((task) => search.matches(task.content)) : tasks
			);
		}
		return map;
	});

	const items = $derived.by(() => {
		const base = dragItems ?? deck.activeProjects;
		if (!search.active) return base;
		return base.filter((project) => (filteredActive.get(project.id)?.length ?? 0) > 0);
	});

	const totalMatchCount = $derived(
		search.active
			? Array.from(filteredActive.values()).reduce((sum, tasks) => sum + tasks.length, 0)
			: 0
	);

	function handleGlobalKeydown(event: KeyboardEvent) {
		if (isImeEvent(event)) return;
		if ((event.metaKey || event.ctrlKey) && !event.altKey && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			if (search.overlayOpen) search.close();
			else search.open();
		}
	}

	function handleGlobalMousedown(event: MouseEvent) {
		if (!search.overlayOpen) return;
		const target = event.target as HTMLElement | null;
		if (!target?.closest('[data-search-overlay-panel]')) {
			search.close();
		}
	}

	function handleConsider(event: CustomEvent<DndEvent<Project>>) {
		dragItems = event.detail.items;
	}

	function handleFinalize(event: CustomEvent<DndEvent<Project>>) {
		deck.reorderProjects(event.detail.items.map((project) => project.id));
		dragItems = null;
	}

	async function handleImport(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;

		const confirmed = confirm('Import will completely replace your current deck. Continue?');
		if (!confirmed) return;

		try {
			await deck.importDeck(JSON.parse(await file.text()));
			sidebarOpen = false;
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Import failed.');
		}
	}

	onMount(() => {
		const url = new URL(location.href);
		const token = url.searchParams.get('token');
		if (token) {
			url.searchParams.delete('token');
			history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);

			const existing = getShelfToken();
			if (
				!existing ||
				existing === token ||
				confirm('Replace your current Shelf sign-in with this new token?')
			) {
				setShelfToken(token);
			}
		}

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
			<div
				class="deck-dndzone flex h-full shrink-0 gap-8"
				use:dragHandleZone={{
					items,
					flipDurationMs: 180,
					type: 'project',
					dropTargetStyle: {},
					zoneTabIndex: -1,
					zoneItemTabIndex: -1,
					dragDisabled: search.active
				}}
				onconsider={handleConsider}
				onfinalize={handleFinalize}
			>
				{#each items as project, index (project.id)}
					<div
						class={[
							'relative max-h-full shrink-0 overflow-visible focus-within:z-20',
							index === 0 && 'pl-9'
						]}
						animate:flip={{ duration: 180 }}
					>
						<ProjectColumn
							{project}
							activeTasks={filteredActive.get(project.id) ?? []}
							archivedTasks={search.active ? [] : deck.archivedTasksForProject(project.id)}
							searchActive={search.active}
							onRenameProject={(projectId, name) => deck.renameProject(projectId, name)}
							onCompleteProject={(projectId) => deck.completeProject(projectId)}
							onDeleteProject={(projectId) => deck.deleteProject(projectId)}
							onToggleCompletedExpanded={(projectId) => deck.toggleCompletedExpanded(projectId)}
							onAddTask={(projectId, tag, content) => deck.addTask(projectId, tag, content)}
							onMoveTasks={(projectId, orderedIds) => deck.moveTasks(projectId, orderedIds)}
							onToggleCompleted={(taskId) => deck.toggleTaskCompleted(taskId)}
							onToggleFlag={(taskId) => deck.toggleTaskFlag(taskId)}
							onUpdateContent={(taskId, content) => deck.updateTaskContent(taskId, content)}
							onSetTag={(taskId, tag) => deck.setTaskTag(taskId, tag)}
							onDelete={(taskId) => deck.deleteTask(taskId)}
						/>
					</div>
				{/each}
			</div>

			{#if !search.active}
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
			{/if}
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
			<button
				class="btn justify-start btn-ghost btn-sm"
				onclick={() => {
					sidebarOpen = false;
					search.open();
				}}
			>
				Search
				<span class="ml-auto text-xs opacity-50">⌘K</span>
			</button>
			<a class="btn justify-start btn-ghost btn-sm" href={resolve('/completed')}>
				Completed projects
				{#if deck.completedProjects.length > 0}
					<span class="ml-auto opacity-50">{deck.completedProjects.length}</span>
				{/if}
			</a>
			<button class="btn justify-start btn-ghost btn-sm" onclick={() => deck.exportDeck()}>
				Export
			</button>
			<button class="btn justify-start btn-ghost btn-sm" onclick={() => importInput?.click()}>
				Import
			</button>
			<input
				bind:this={importInput}
				class="hidden"
				type="file"
				accept="application/json,.json"
				onchange={handleImport}
			/>
			{#if deck.hasCompletedTasks}
				<button
					class="btn justify-start btn-ghost btn-sm"
					onclick={() => deck.archiveAllCompletedTasks()}
				>
					Archive done
				</button>
			{/if}
		</nav>

		<SyncPanel />
	</aside>

	<button
		class="btn fixed bottom-4 left-4 z-50 btn-circle border border-base-content/10 bg-base-100/82 shadow-lg backdrop-blur-xl btn-sm"
		aria-label="Open sidebar"
		onclick={() => (sidebarOpen = !sidebarOpen)}
	>
		☰
	</button>

	<SearchChip matchCount={totalMatchCount} />
	<SearchOverlay />
</div>

<svelte:window onkeydown={handleGlobalKeydown} onmousedown={handleGlobalMousedown} />
