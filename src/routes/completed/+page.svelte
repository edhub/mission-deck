<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import TaskItem from '$lib/features/deck/TaskItem.svelte';
	import { deck } from '$lib/features/deck/state.svelte';
	import { TaskEditor } from '$lib/features/editor';

	onMount(() => {
		deck.load();
	});
</script>

<svelte:head>
	<title>Completed Projects · Mission Deck</title>
</svelte:head>

<div class="min-h-screen bg-linear-to-b from-base-100 to-base-300 px-5 py-5">
	<header class="mb-6 flex items-center justify-between gap-4">
		<div>
			<p class="mb-1 text-xs font-semibold tracking-wider text-base-content/45 uppercase">
				Mission Deck
			</p>
			<h1 class="text-2xl font-semibold tracking-tight">Completed projects</h1>
		</div>
		<a class="btn btn-ghost btn-sm" href={resolve('/')}>Back to deck</a>
	</header>

	{#if !deck.loaded}
		<main class="grid min-h-80 place-items-center text-base-content/60">
			Loading completed projects…
		</main>
	{:else if deck.completedProjects.length === 0}
		<main
			class="grid min-h-80 place-items-center rounded-3xl border border-dashed border-base-content/12 bg-base-100/30 text-base-content/50"
		>
			No completed projects yet.
		</main>
	{:else}
		<main class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each deck.completedProjects as project (project.id)}
				<section
					class="group overflow-hidden rounded-3xl border border-base-content/10 bg-base-100/70 p-4 shadow-sm"
				>
					<div class="mb-4 flex items-start justify-between gap-3">
						<div class="min-w-0">
							<TaskEditor
								content={project.name}
								editable={false}
								surfaceClass="is-project-title text-base-content/80"
							/>
							{#if project.completedAt}
								<p class="mt-1 text-xs text-base-content/40">
									Completed {new Date(project.completedAt).toLocaleDateString()}
								</p>
							{/if}
						</div>
						<div
							class="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100"
						>
							<button class="btn btn-ghost btn-xs" onclick={() => deck.reopenProject(project.id)}>
								Reopen
							</button>
							<button
								class="btn text-error btn-ghost btn-xs"
								onclick={() => {
									if (confirm('Delete this project and all of its tasks?'))
										deck.deleteProject(project.id);
								}}
							>
								Delete
							</button>
						</div>
					</div>

					<div class="grid gap-3">
						{#each deck.activeTasksForProject(project.id) as task (task.id)}
							<TaskItem
								{task}
								onToggleCompleted={() => {}}
								onToggleFlag={() => {}}
								onUpdateContent={() => {}}
								onSetTag={() => {}}
								onDelete={() => {}}
								readOnly
							/>
						{/each}
					</div>
				</section>
			{/each}
		</main>
	{/if}
</div>
