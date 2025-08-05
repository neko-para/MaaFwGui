import tailwind from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config
export default defineConfig({
    root: path.resolve(import.meta.dirname),
    base: './',
    server: {
        host: '127.0.0.1',
        port: 5173
    },
    build: {
        outDir: '../../dist/renderer',
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            output: {
                entryFileNames: `assets/[name].js`,
                chunkFileNames: `assets/[name].js`,
                assetFileNames: `assets/[name].[ext]`
            }
        }
    },
    resolve: {
        alias: {
            '@': path.join(import.meta.dirname, 'src')
        }
    },
    plugins: [vue(), vueJsx(), tailwind()]
})
