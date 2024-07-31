import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// @ts-ignore
	plugins: [sveltekit(), AutoRefreshHmr()]
});


function AutoRefreshHmr() {
	return {
		name: 'auto-refresh',
		enforce: 'post',
		// @ts-ignore
		handleHotUpdate({ file, server }) {
			if (file.endsWith('.svelte') || file.endsWith('.js')) {
				server.ws.send({
					type: 'full-reload',
					path: '*'
				});
			}
		}
	};
}