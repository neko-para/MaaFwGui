import { Interface, ProjectId } from '@mfg/types'
import { dialog } from 'electron'
import { existsSync } from 'fs'
import fs from 'fs/promises'
import * as path from 'path'

import { generateId } from '../utils/uuid'
import { window } from '../window'
import { mfgApp } from './app'

export class MfgProjectManager {
    async init() {
        globalThis.main.project.query = async () => {
            return mfgApp.config.projects ?? []
        }
        globalThis.main.project.newExternal = async () => {
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
                type: 'external',
                path: file
            })
            await mfgApp.saveConfig()
            return true
        }
        globalThis.main.project.del = async id => {
            if (!mfgApp.config.projects) {
                return false
            }

            const projectIndex = mfgApp.config.projects.findIndex(x => x.id === id)
            if (projectIndex === -1) {
                return false
            }

            const project = mfgApp.config.projects[projectIndex]

            for (const profile of mfgApp.config.profiles ?? []) {
                for (const stage of profile.stages) {
                    if (stage.project === id) {
                        return false
                    }
                }
            }

            if (project.github) {
                const repo = mfgApp.config.github?.repos?.find(x => x.id === project.github)
                if (repo) {
                    delete repo.expose
                }
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
