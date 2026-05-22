import type { DeckSnapshot } from '$lib/features/deck/types';
import { getShelfToken } from './session';

export const SHELF_URL = 'https://shelf.tyun.fun';
export const BACKUP_FILENAME = 'mission-deck.json';

export interface ShelfUser {
	github_id: number;
	username: string;
	avatar_url: string | null;
}

export interface BackupEntry {
	id: string;
	filename: string;
	timestamp_ms: number;
	created_at: string;
	size_bytes: number;
}

export class ShelfApiError extends Error {
	constructor(
		message: string,
		readonly status: number
	) {
		super(message);
		this.name = 'ShelfApiError';
	}
}

async function shelfFetch(path: string, init: RequestInit = {}) {
	const token = getShelfToken();
	if (!token) throw new Error('Not signed in.');

	const headers = new Headers(init.headers);
	headers.set('Authorization', `Bearer ${token}`);

	const response = await fetch(`${SHELF_URL}${path}`, {
		...init,
		headers
	});

	if (!response.ok) {
		const message = await response.text().catch(() => '');
		throw new ShelfApiError(
			message || `Shelf request failed (${response.status}).`,
			response.status
		);
	}

	return response;
}

export function buildLoginUrl() {
	const url = new URL('/auth/login', SHELF_URL);
	url.searchParams.set('redirect_uri', `${location.origin}/`);
	return url.toString();
}

export async function loadShelfUser() {
	const response = await shelfFetch('/api/me');
	return (await response.json()) as ShelfUser;
}

export async function uploadBackup(snapshot: DeckSnapshot) {
	const form = new FormData();
	form.append(
		'file',
		new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }),
		BACKUP_FILENAME
	);

	const response = await shelfFetch('/api/backups', {
		method: 'POST',
		body: form
	});
	return (await response.json()) as BackupEntry;
}

export async function listBackups() {
	const response = await shelfFetch('/api/backups');
	const backups = (await response.json()) as BackupEntry[];
	return backups.filter((backup) => backup.filename === BACKUP_FILENAME);
}

export async function downloadBackup(id: string) {
	const response = await shelfFetch(`/api/backups/${encodeURIComponent(id)}`);
	return JSON.parse(await response.text()) as unknown;
}
