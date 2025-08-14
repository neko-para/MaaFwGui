import { existsSync } from 'fs'
import * as fs from 'fs/promises'
import pacote from 'pacote'
import path from 'path'
import { lock } from 'proper-lockfile'

export const maaRegistry = {
    npm: 'https://registry.npmjs.org',
    cnpm: 'https://registry.npmmirror.com'
}

export type MaaPrepareProgressState =
    | 'checking'
    | 'preparing-folder'
    | 'downloading-scripts'
    | 'downloading-binary'
    | 'moving-folder'
    | 'succeeded'
    | 'failed'

export type MaaPrepareProgress = (state: MaaPrepareProgressState) => void

export type Maa = typeof import('@maaxyz/maa-node')

export type MaaLoaderRegistry = keyof typeof maaRegistry

export type MaaLoaderOption = {
    root: string

    registry: MaaLoaderRegistry
    version: string
}

export class MaaLoader {
    option: MaaLoaderOption

    rootPath: string
    cachePath: string
    downloadPath: string
    installPath: string

    instance: Maa | null

    constructor(option: MaaLoaderOption) {
        this.option = option

        this.rootPath = this.option.root
        this.cachePath = path.join(this.rootPath, 'cache')
        this.downloadPath = path.join(this.rootPath, 'download')
        this.installPath = path.join(this.rootPath, 'install')

        this.instance = null
    }

    async init() {
        await fs.mkdir(this.cachePath, { recursive: true })
        await fs.mkdir(this.downloadPath, { recursive: true })
        await fs.mkdir(this.installPath, { recursive: true })
    }

    get config() {
        return {
            registry: maaRegistry[this.option.registry],
            cache: this.cachePath
        }
    }

    lock() {
        return lock(this.rootPath).then(
            release => release,
            () => null
        )
    }

    folderFor(version: string) {
        return path.join(this.installPath, version)
    }

    async allLocalVersions() {
        let release = await this.lock()
        if (!release) {
            return []
        }

        const localVersions = (await fs.readdir(this.installPath, { withFileTypes: true }))
            .filter(info => info.isDirectory())
            .map(info => info.name)
        await release()
        return localVersions
    }

    async allRemoteVersions() {
        let release = await this.lock()
        if (!release) {
            return []
        }

        const result = await pacote.packument('@maaxyz/maa-node', this.config)
        await release()
        return Object.entries(result.versions)
    }

    async latestVersion() {
        let release = await this.lock()
        if (!release) {
            return null
        }

        const result = await pacote.manifest('@maaxyz/maa-node@latest', this.config)
        await release()
        return result
    }

    async prepare(version: string, onProgress: MaaPrepareProgress) {
        onProgress('checking')

        const versionFolder = this.folderFor(version)

        const release = await this.lock()
        if (!release) {
            onProgress('failed')
            return false
        }

        if (existsSync(versionFolder)) {
            await fs.writeFile(path.join(versionFolder, 'timestamp'), Date.now().toString())
            await release()
            onProgress('succeeded')
            return true
        }

        onProgress('preparing-folder')

        const loaderTemp = await fs.mkdtemp(path.join(this.downloadPath, 'loader-'))
        const binaryTemp = await fs.mkdtemp(path.join(this.downloadPath, 'binary-'))

        onProgress('downloading-scripts')

        await pacote.extract(`@maaxyz/maa-node@${version}`, loaderTemp, this.config)

        onProgress('downloading-binary')

        await pacote.extract(
            `@maaxyz/maa-node-${process.platform}-${process.arch}@${version}`,
            binaryTemp,
            this.config
        )

        onProgress('moving-folder')

        await fs.mkdir(path.join(versionFolder, 'node_modules', '@maaxyz'), {
            recursive: true
        })
        await fs.writeFile(path.join(versionFolder, 'timestamp'), Date.now().toString())

        await fs.rename(loaderTemp, path.join(versionFolder, 'node_modules', '@maaxyz', 'maa-node'))
        await fs.rename(
            binaryTemp,
            path.join(
                versionFolder,
                'node_modules',
                '@maaxyz',
                `maa-node-${process.platform}-${process.arch}`
            )
        )

        release()
        onProgress('succeeded')
        return true
    }

    async cleanUnused(threshold = 7 * 24 * 60 * 60 * 1000) {
        let release = await this.lock()
        if (!release) {
            return
        }

        for (const info of await fs.readdir(this.installPath, { withFileTypes: true })) {
            if (!info.isDirectory()) {
                continue
            }
            if (info.name == this.option.version) {
                continue
            }
            const versionFolder = this.folderFor(info.name)
            const timestampFile = path.join(versionFolder, 'timestamp')
            if (existsSync(timestampFile)) {
                const content = await fs.readFile(timestampFile, 'utf8')
                const delta = Date.now() - parseInt(content)

                if (delta > threshold) {
                    await fs.rm(versionFolder, { recursive: true })
                }
            } else {
                await fs.rm(versionFolder, { recursive: true })
            }
        }
        await release()
    }

    async load(onProgress?: MaaPrepareProgress): Promise<Maa | null> {
        if (this.instance) {
            return this.instance
        }

        if (!(await this.prepare(this.option.version, onProgress ?? (() => {})))) {
            return null
        }

        module.paths.unshift(path.join(this.folderFor(this.option.version), 'node_modules'))

        try {
            this.instance = require('@maaxyz/maa-node')
        } catch {
            return null
        }

        this.cleanUnused()

        return this.instance
    }
}
