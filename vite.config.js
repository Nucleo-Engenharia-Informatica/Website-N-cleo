import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // 1. Caminho base para garantir que os links compilados são relativos
    base: './',

    // 2. Set root to public directory where HTML files are located
    root: 'public',

    // 3. Set publicDir to serve static assets (images, etc.)
    publicDir: 'images', // Copy images to dist during build

    build: {
        // 4. outDir relative to project root, not public/
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                // 5. Paths relative to root (public/)
                index: resolve(__dirname, 'public/index.html'),
                eventos: resolve(__dirname, 'public/eventos.html'),
                parceiros: resolve(__dirname, 'public/parceiros.html'),
                quem: resolve(__dirname, 'public/quem.html'),
                admin: resolve(__dirname, 'public/admin.html')
            }
        }
    }
});