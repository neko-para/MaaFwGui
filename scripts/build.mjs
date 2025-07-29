import esbuild from 'esbuild'
import { build } from 'vite'

await esbuild.build({
    entryPoints: ['pkgs/main/src/main.ts'],
    platform: 'node',
    bundle: true,
    external: ['electron', '@maaxyz/maa-node', '@aws-sdk/client-s3'],
    outdir: './dist/main',
    minify: true,
    sourcemap: true
})
await build({ configFile: 'pkgs/preload/vite.config.mts' })
await build({ configFile: 'pkgs/renderer/vite.config.mts' })
