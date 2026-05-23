import type { Action } from 'svelte/action';

/**
 * Moves the node to `target` (default: document.body) so it escapes any
 * ancestor clipping/stacking context. Restores on destroy by removing.
 */
export const portal: Action<HTMLElement, HTMLElement | undefined> = (node, target) => {
	const dest = target ?? document.body;
	dest.appendChild(node);
	return {
		destroy() {
			node.remove();
		}
	};
};
