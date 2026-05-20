<script lang="ts">
	import { onMount } from 'svelte';

	interface BeforeInstallPromptEvent extends Event {
		prompt: () => Promise<void>;
		userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
	}

	let installPrompt = $state<BeforeInstallPromptEvent | null>(null);
	let isStandalone = $state(false);

	onMount(() => {
		const standaloneQuery = window.matchMedia('(display-mode: standalone)');
		isStandalone =
			standaloneQuery.matches ||
			Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

		const handleBeforeInstallPrompt = (event: Event) => {
			event.preventDefault();
			installPrompt = event as BeforeInstallPromptEvent;
		};

		const handleInstalled = () => {
			installPrompt = null;
			isStandalone = true;
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', handleInstalled);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			window.removeEventListener('appinstalled', handleInstalled);
		};
	});

	async function install() {
		if (!installPrompt) return;

		const prompt = installPrompt;
		installPrompt = null;
		await prompt.prompt();
		await prompt.userChoice;
	}
</script>

{#if installPrompt && !isStandalone}
	<button class="btn fixed right-4 bottom-4 z-50 shadow-lg btn-sm btn-primary" onclick={install}>
		Install app
	</button>
{/if}
