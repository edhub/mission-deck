<script lang="ts">
	import { onMount } from 'svelte';
	import { deck } from '$lib/features/deck/state.svelte';
	import {
		buildLoginUrl,
		downloadBackup,
		listBackups,
		loadShelfUser,
		ShelfApiError,
		type BackupEntry,
		type ShelfUser,
		uploadBackup
	} from './api';
	import { clearShelfToken, getShelfToken, TOKEN_CHANGED_EVENT } from './session';

	let token = $state<string | null>(null);
	let user = $state<ShelfUser | null>(null);
	let backups = $state<BackupEntry[]>([]);
	let busy = $state(false);
	let message = $state('');
	let error = $state('');

	const signedIn = $derived(Boolean(token));

	function setStatus(nextMessage = '', nextError = '') {
		message = nextMessage;
		error = nextError;
	}

	function signIn() {
		location.href = buildLoginUrl();
	}

	function resetSession() {
		clearShelfToken();
		token = null;
		user = null;
		backups = [];
	}

	function errorMessage(caught: unknown, fallback: string) {
		return caught instanceof Error ? caught.message : fallback;
	}

	function signOut() {
		resetSession();
		setStatus('Signed out.');
	}

	async function refresh() {
		if (!token) return;

		busy = true;
		setStatus();
		try {
			[user, backups] = await Promise.all([loadShelfUser(), listBackups()]);
		} catch (caught) {
			if (caught instanceof ShelfApiError && caught.status === 401) {
				resetSession();
				setStatus('', 'Shelf sign-in expired. Please sign in again.');
			} else {
				setStatus('', errorMessage(caught, 'Sync refresh failed.'));
			}
		} finally {
			busy = false;
		}
	}

	async function upload() {
		busy = true;
		setStatus();
		try {
			await uploadBackup(deck.snapshot);
		} catch (caught) {
			setStatus('', errorMessage(caught, 'Upload failed.'));
			busy = false;
			return;
		}

		try {
			backups = await listBackups();
			setStatus('Backup uploaded.');
		} catch {
			setStatus('Backup uploaded, but failed to refresh the backup list.');
		} finally {
			busy = false;
		}
	}

	async function restore(backup: BackupEntry) {
		const confirmed = confirm(
			`Restore backup from ${new Date(backup.created_at).toLocaleString()}? This will replace your current deck.`
		);
		if (!confirmed) return;

		busy = true;
		setStatus();
		try {
			await deck.importDeck(await downloadBackup(backup.id));
			setStatus('Backup restored.');
		} catch (caught) {
			setStatus('', errorMessage(caught, 'Restore failed.'));
		} finally {
			busy = false;
		}
	}

	function syncTokenFromStorage() {
		token = getShelfToken();
		if (token) refresh();
	}

	onMount(() => {
		syncTokenFromStorage();
		window.addEventListener(TOKEN_CHANGED_EVENT, syncTokenFromStorage);
		return () => window.removeEventListener(TOKEN_CHANGED_EVENT, syncTokenFromStorage);
	});
</script>

<div class="mt-5 border-t border-base-content/10 pt-4">
	<div class="mb-2 flex items-center justify-between gap-2">
		<p class="text-xs font-semibold tracking-wider text-base-content/45 uppercase">Shelf sync</p>
		{#if signedIn}
			<button class="btn btn-ghost btn-xs" onclick={refresh} disabled={busy}>Refresh</button>
		{/if}
	</div>

	{#if !signedIn}
		<button class="btn w-full justify-start btn-sm btn-primary" onclick={signIn}
			>Sign in with GitHub</button
		>
	{:else}
		<div class="grid gap-2">
			{#if user}
				<div class="flex items-center gap-2 rounded-box bg-base-200/70 p-2 text-sm">
					{#if user.avatar_url}
						<img class="size-6 rounded-full" src={user.avatar_url} alt="" />
					{/if}
					<span class="truncate">{user.username}</span>
				</div>
			{/if}

			<button
				class="btn justify-start btn-sm btn-primary"
				onclick={upload}
				disabled={busy || !deck.loaded}
			>
				Upload backup
			</button>

			{#if backups.length > 0}
				<div class="grid gap-1">
					<p class="mt-1 text-xs text-base-content/50">Restore from backup</p>
					{#each backups.slice(0, 5) as backup (backup.id)}
						<button
							class="btn h-auto justify-start py-2 text-left btn-ghost btn-sm"
							onclick={() => restore(backup)}
							disabled={busy}
						>
							<span class="grid leading-tight">
								<span>{new Date(backup.created_at).toLocaleString()}</span>
								<span class="text-xs font-normal text-base-content/45">
									{Math.round(backup.size_bytes / 1024)} KB
								</span>
							</span>
						</button>
					{/each}
				</div>
			{:else if !busy}
				<p class="text-xs text-base-content/45">No Mission Deck backups yet.</p>
			{/if}

			<button class="btn justify-start btn-ghost btn-sm" onclick={signOut} disabled={busy}
				>Sign out</button
			>
		</div>
	{/if}

	{#if busy}
		<p class="mt-2 text-xs text-base-content/45">Working…</p>
	{/if}
	{#if message}
		<p class="mt-2 text-xs text-success">{message}</p>
	{/if}
	{#if error}
		<p class="mt-2 text-xs text-error">{error}</p>
	{/if}
</div>
