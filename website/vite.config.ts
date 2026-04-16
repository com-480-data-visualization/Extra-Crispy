import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const isGitHubActionsBuild = process.env.GITHUB_ACTIONS === 'true';

  return {
    // GitHub Pages serves project sites from /<repo>/, while local dev stays at /.
    base: isGitHubActionsBuild ? '/Extra-Crispy/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR can be toggled via the DISABLE_HMR environment variable.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
