import { defineConfig } from 'vite';
import path from 'path';

const resolve = (p) => path.resolve(__dirname, p);

export default defineConfig({
    // Removido 'root: "public"', pois a raiz é onde está o package.json
    
    // Adicionar o base path para compatibilidade com Vercel/caminhos relativos
    base: './', 

    resolve: {
        // Agora, /src é relativo à raiz do projeto
        alias: {
            '/src': resolve('src'),
            '@': resolve('src')
        }
    },
    server: {
        fs: {
            strict: false,
            // Permite acesso a todos os ficheiros a partir da raiz
            allow: [resolve('.'), resolve('public'), resolve('src'), __dirname]
        }
    },
    build: {
        // outDir agora é 'dist' dentro da raiz do projeto
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                // Manter 'public/' se os ficheiros HTML estiverem lá (como na imagem)
                index: resolve('public/index.html'), 
                eventos: resolve('public/eventos.html'),
                parceiros: resolve('public/parceiros.html')
            }
        }
    }
});