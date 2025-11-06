import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
  // Set base for GitHub Pages deployments if needed via env
  base: process.env.VITE_BASE_PATH || '/',
});


