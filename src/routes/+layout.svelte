<script lang="ts">
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import InstallAppButton from '$lib/features/pwa/InstallAppButton.svelte';
	import './layout.css';

	let { children } = $props();

	onMount(async () => {
		if (!pwaInfo) return;

		const { registerSW } = await import('virtual:pwa-register');
		registerSW({ immediate: true });
	});
</script>

<svelte:head>
	<title>Mission Deck</title>
	<meta name="description" content="A local-first task deck for personal missions." />
	<meta name="theme-color" content="#f5f5f4" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<link rel="icon" href="/icon.svg" />
	<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
</svelte:head>
{@render children()}
<InstallAppButton />
