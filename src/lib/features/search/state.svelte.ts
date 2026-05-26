export function isImeEvent(event: KeyboardEvent): boolean {
	return event.isComposing;
}

function htmlToPlainText(html: string): string {
	return html
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase();
}

class SearchState {
	query = $state('');
	overlayOpen = $state(false);

	get normalizedQuery(): string {
		return this.query.trim().toLowerCase();
	}

	get active(): boolean {
		return this.normalizedQuery.length > 0;
	}

	open() {
		this.overlayOpen = true;
	}

	close() {
		this.overlayOpen = false;
	}

	clear() {
		this.query = '';
		this.overlayOpen = false;
	}

	matches(content: string): boolean {
		const q = this.normalizedQuery;
		if (!q) return true;
		return htmlToPlainText(content).includes(q);
	}
}

export const search = new SearchState();
