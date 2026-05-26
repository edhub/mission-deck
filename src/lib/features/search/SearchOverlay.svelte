<script lang="ts">
	import { tick } from 'svelte';
	import { isImeEvent, search } from './state.svelte';

	let inputEl = $state<HTMLInputElement>();

	$effect(() => {
		if (search.overlayOpen) {
			tick().then(() => {
				inputEl?.focus();
				inputEl?.select();
			});
		}
	});

	function onInput(event: Event) {
		const input = event as InputEvent;
		if (input.isComposing) return;
		search.query = (event.currentTarget as HTMLInputElement).value;
	}

	function onCompositionEnd(event: CompositionEvent) {
		search.query = (event.currentTarget as HTMLInputElement).value;
	}

	function onKeydown(event: KeyboardEvent) {
		if (isImeEvent(event)) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			search.clear();
		}
	}
</script>

{#if search.overlayOpen}
	<div class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4">
		<div
			data-search-overlay-panel
			class="pointer-events-auto flex w-full max-w-md items-center gap-2 rounded-2xl border border-base-content/10 bg-base-100/92 px-4 py-2.5 shadow-2xl backdrop-blur-2xl"
			role="dialog"
			aria-label="Filter tasks"
		>
			<span class="text-base-content/45" aria-hidden="true">⌕</span>
			<input
				bind:this={inputEl}
				value={search.query}
				type="text"
				class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-base-content/35"
				placeholder="Filter tasks…"
				autocomplete="off"
				spellcheck="false"
				oninput={onInput}
				oncompositionend={onCompositionEnd}
				onkeydown={onKeydown}
			/>
			{#if search.query.length > 0}
				<button
					type="button"
					class="btn btn-circle text-base-content/50 btn-ghost btn-xs"
					aria-label="Clear filter"
					onclick={() => search.clear()}
				>
					×
				</button>
			{/if}
		</div>
	</div>
{/if}
