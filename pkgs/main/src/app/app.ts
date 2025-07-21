import { app } from 'electron'
import fs from 'fs/promises'
import path from 'path'

import pkg from '../../../../package.json'
import { MfgProjectManager } from './projectManager'
import { AppConfig } from './types'

class MfgApp {
    root: string

    config: AppConfig
    projectManager: MfgProjectManager

    constructor(root: string) {
        this.root = root

        this.config = {}
        this.projectManager = new MfgProjectManager()
    }

    async init() {
        await fs.mkdir(this.root, { recursive: true })

        await this.loadConfig()

        await this.projectManager.init()
    }

    get configPath() {
        return path.join(this.root, 'config.json')
    }

    async loadConfig() {
        try {
            this.config = JSON.parse(await fs.readFile(this.configPath, 'utf8'))
        } catch {
            this.config = {}
        }
    }

    async saveConfig() {
        await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 4))
    }
}

export const mfgApp = new MfgApp(path.join(app.getPath('appData'), pkg.name, 'MfgData'))
