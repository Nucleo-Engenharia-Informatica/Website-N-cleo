import { defineConfig } from 'vite';

export default defineConfig({
    // 1. Caminho base para garantir que os links compilados são relativos
    base: './', 

    build: {
        // 2. outDir: 'dist' (Corrigido)
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                // 3. Caminhos absolutos/simples para o ponto de entrada HTML
                index: 'public/index.html',
                eventos: 'public/eventos.html',
                parceiros: 'public/parceiros.html'
            }
        }
    }
});