<script lang="ts">
	import { search } from './state.svelte';

	let { matchCount }: { matchCount: number } = $props();
</script>

{#if search.active && !search.overlayOpen}
	<div
		class="fixed bottom-4 left-16 z-50 flex items-center rounded-full border border-base-content/10 bg-base-100/82 shadow-lg backdrop-blur-xl"
	>
		<button
			type="button"
			class="flex items-center gap-2 rounded-l-full py-1.5 pr-2 pl-3 text-sm transition hover:bg-base-content/5"
			aria-label="Edit filter"
			title="Edit filter"
			onclick={() => search.open()}
		>
			<span class="text-base-content/50" aria-hidden="true">⌕</span>
			<span class="max-w-40 truncate">{search.query}</span>
			<span class="text-xs text-base-content/45">{matchCount}</span>
		</button>
		<button
			type="button"
			class="mr-1 grid size-7 place-items-center rounded-full text-base-content/50 transition hover:bg-base-content/10 hover:text-base-content/80"
			aria-label="Clear filter"
			title="Clear filter"
			onclick={() => search.clear()}
		>
			×
		</button>
	</div>
{/if}
