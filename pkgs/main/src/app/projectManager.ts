import { Interface, ProjectId } from '@mfg/types'
import { dialog } from 'electron'
import * as gitFs from 'fs'
import { existsSync } from 'fs'
import fs from 'fs/promises'
import * as git from 'isomorphic-git'
import * as gitHttp from 'isomorphic-git/http/node'
import path from 'path'

import { generateId } from '../utils/uuid'
import { window } from '../window'
import { mfgApp } from './app'

export class MfgProjectManager {
    async init() {
        globalThis.main.project.query = async () => {
            return mfgApp.config.projects ?? []
        }
        globalThis.main.project.new = async (type, info) => {
            switch (type) {
                case 'external': {
                    const result = await dialog.showOpenDialog(window, {
                        title: '打开 interface.json',
                        filters: [
                            {
                                name: 'interface',
                                extensions: ['json']
                            }
                        ]
                    })
                    const file = result.filePaths[0]
                    if (!file) {
                        return false
                    }
                    let dir = path.dirname(file)
                    if (['assets', 'install'].includes(path.basename(dir))) {
                        dir = path.dirname(dir)
                    }
                    mfgApp.config.projects = mfgApp.config.projects ?? []
                    mfgApp.config.projects.push({
                        id: generateId() as ProjectId,
                        name: path.basename(dir),
                        path: file,
                        type: 'external'
                    })
                    await mfgApp.saveConfig()
                    return true
                }
                case 'managed': {
                    if (!info) {
                        return false
                    }
                    switch (info.type) {
                        case 'githubRepo': {
                            const pid = generateId() as ProjectId
                            const storeFolder = path.join(mfgApp.root, 'projects', pid)
                            try {
                                await git.clone({
                                    fs: gitFs,
                                    http: gitHttp,
                                    url: info.url,
                                    dir: storeFolder,
                                    onProgress: event => {
                                        globalThis.renderer.project.cloneProgress(
                                            event.phase,
                                            event.loaded,
                                            event.total
                                        )
                                    }
                                })
                            } catch {
                                await fs.rm(storeFolder, { recursive: true })
                                return false
                            }

                            // TODO: glob search, or maybe ask user
                            const possiblePlaces = [
                                path.join(storeFolder, 'interface.json'),
                                path.join(storeFolder, 'assets', 'interface.json'),
                                path.join(storeFolder, 'install', 'interface.json')
                            ]
                            let interfacePath: string | null = null
                            for (const place of possiblePlaces) {
                                if (existsSync(place)) {
                                    interfacePath = place
                                    break
                                }
                            }
                            if (!interfacePath) {
                                await fs.rm(storeFolder, { recursive: true })
                                return false
                            }

                            mfgApp.config.projects = mfgApp.config.projects ?? []
                            mfgApp.config.projects.push({
                                id: pid,
                                name: info.url.slice(info.url.lastIndexOf('/') + 1),
                                path: interfacePath,
                                type: 'managed',
                                managed: {
                                    path: storeFolder,
                                    ...info
                                }
                            })
                            await mfgApp.saveConfig()
                            break
                        }
                    }
                    return true
                }
            }
            return false
        }
        globalThis.main.project.del = async id => {
            if (!mfgApp.config.projects) {
                return false
            }

            const projectIndex = mfgApp.config.projects.findIndex(x => x.id === id)
            if (projectIndex === -1) {
                return false
            }

            const proj = mfgApp.config.projects[projectIndex]

            for (const profile of mfgApp.config.profiles ?? []) {
                for (const stage of profile.stages) {
                    if (stage.project === id) {
                        return false
                    }
                }
            }

            switch (proj.type) {
                case 'external':
                    // no clean up
                    break
                case 'managed':
                    if (proj.managed) {
                        await fs.rm(proj.managed.path, { recursive: true })
                    }
                    break
            }

            mfgApp.config.projects.splice(projectIndex, 1)
            await mfgApp.saveConfig()

            return true
        }
        globalThis.main.project.load = async id => {
            return mfgApp.config.projects?.find(x => x.id === id) ?? null
        }
        globalThis.main.project.loadInterface = async id => {
            return this.loadInterface(id)
        }
        // globalThis.main.project.loadConfig = id => {
        //     return mfgApp.config.projectConfigs?.[id] ?? null
        // }
        // globalThis.main.project.updateConfig = async (id, cfg) => {
        //     mfgApp.config.projectConfigs = mfgApp.config.projectConfigs ?? {}
        //     mfgApp.config.projectConfigs[id] = {
        //         ...mfgApp.config.projectConfigs[id],
        //         ...cfg
        //     }
        //     await mfgApp.saveConfig()
        // }
    }

    async loadInterface(pid: ProjectId) {
        const info = mfgApp.config.projects?.find(x => x.id === pid)
        if (!info) {
            return null
        }
        const content = JSON.parse(await fs.readFile(info.path, 'utf8')) as Interface
        return content
    }
}
