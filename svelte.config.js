import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter(
      {
        runtime: 'nodejs20.x'
      }
    ),
    version: {
      name: process.env.npm_package_version
    },
    csrf: {
      // Wyłączamy sprawdzanie pochodzenia dla żądań API
      checkOrigin: false
    },
  },
  preprocess: vitePreprocess()
};

export default config;