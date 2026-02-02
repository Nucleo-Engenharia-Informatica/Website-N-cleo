import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: './',
    root: 'public',
    // ESTA LINHA É A CHAVE: Diz ao Vite para procurar o .env um nível acima
    envDir: '../', 
    publicDir: 'images',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'public/index.html'),
                eventos: resolve(__dirname, 'public/eventos.html'),
                parceiros: resolve(__dirname, 'public/parceiros.html'),
                quem: resolve(__dirname, 'public/quem.html'),
                admin: resolve(__dirname, 'public/admin.html')
            }
        }
    }
});