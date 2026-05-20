import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			includeAssets: ['icon.svg', 'apple-touch-icon.png'],
			manifest: {
				name: 'Mission Deck',
				short_name: 'Mission Deck',
				description: 'A local-first task deck for personal missions.',
				start_url: '/',
				scope: '/',
				display: 'standalone',
				background_color: '#f5f5f4',
				theme_color: '#f5f5f4',
				icons: [
					{
						src: '/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			kit: {
				includeVersionFile: true
			},
			devOptions: {
				enabled: true,
				navigateFallback: '/',
				type: 'module'
			}
		})
	]
});
