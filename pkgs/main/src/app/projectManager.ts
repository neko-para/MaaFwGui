import { Interface, ProjectId } from '@mfg/types'
import { dialog } from 'electron'
import fs from 'fs/promises'
import path from 'path'

import { generateId } from '../utils/uuid'
import { window } from '../window'
import { mfgApp } from './app'

export class MfgProjectManager {
    async init() {
        globalThis.main.project.query = async () => {
            return mfgApp.config.projects ?? []
        }
        globalThis.main.project.new = async () => {
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
            if (file) {
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
            }
        }
        globalThis.main.project.load = async id => {
            return mfgApp.config.projects?.find(x => x.id === id) ?? null
        }
        globalThis.main.project.loadInterface = async id => {
            const info = mfgApp.config.projects?.find(x => x.id === id)
            if (!info) {
                return null
            }
            const content = JSON.parse(await fs.readFile(info.path, 'utf8')) as Interface
            return content
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
}
