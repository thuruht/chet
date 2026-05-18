import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/index.ts',
      output: {
        entryFileNames: 'index.js',
        format: 'es',
      },
      preserveEntrySignatures: 'strict',
      external: ['agents', 'cloudflare:workers'],
    },
    target: 'es2022',
    minify: false,
  },
});