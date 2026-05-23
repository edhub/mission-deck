import type { Action } from 'svelte/action';

export type FloatingStyle = {
	top?: number;
	left?: number;
	right?: number;
	bottom?: number;
};

export type FloatingParams = {
	reference: HTMLElement | null | undefined;
	position: (rect: DOMRect) => FloatingStyle;
};

/**
 * Pins a node to a reference element via `position: fixed`, recomputing
 * whenever any ancestor scrolls, the window resizes, or either element
 * changes size. Lets a floating panel escape an `overflow: hidden` parent.
 */
export const floating: Action<HTMLElement, FloatingParams> = (node, initial) => {
	let params = initial;

	const apply = () => {
		const ref = params.reference;
		if (!ref) return;
		const rect = ref.getBoundingClientRect();
		const style = params.position(rect);
		node.style.position = 'fixed';
		node.style.top = style.top != null ? `${style.top}px` : '';
		node.style.left = style.left != null ? `${style.left}px` : '';
		node.style.right = style.right != null ? `${style.right}px` : '';
		node.style.bottom = style.bottom != null ? `${style.bottom}px` : '';
	};

	const ro = new ResizeObserver(apply);
	const observe = () => {
		ro.disconnect();
		if (params.reference) ro.observe(params.reference);
		ro.observe(node);
	};

	apply();
	observe();
	window.addEventListener('scroll', apply, true);
	window.addEventListener('resize', apply);

	return {
		update(next: FloatingParams) {
			params = next;
			observe();
			apply();
		},
		destroy() {
			window.removeEventListener('scroll', apply, true);
			window.removeEventListener('resize', apply);
			ro.disconnect();
		}
	};
};
