import { browser } from '$app/environment';

export const TOKEN_KEY = 'mission-deck.shelf-token';
export const TOKEN_CHANGED_EVENT = 'mission-deck:shelf-token-changed';

function notifyTokenChanged() {
	window.dispatchEvent(new CustomEvent(TOKEN_CHANGED_EVENT));
}

export function getShelfToken() {
	if (!browser) return null;
	return localStorage.getItem(TOKEN_KEY);
}

export function setShelfToken(token: string) {
	if (!browser) return;
	localStorage.setItem(TOKEN_KEY, token);
	notifyTokenChanged();
}

export function clearShelfToken() {
	if (!browser) return;
	localStorage.removeItem(TOKEN_KEY);
	notifyTokenChanged();
}
