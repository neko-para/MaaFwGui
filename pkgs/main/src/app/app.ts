import { app } from 'electron'
import fs from 'fs/promises'
import path from 'path'

import pkg from '../../../../package.json'
import { MfgDeviceManager } from './deviceManager'
import { MfgLaunchManager } from './launchManager'
import { MfgProfileManager } from './profileManager'
import { MfgProjectManager } from './projectManager'
import { AppConfig } from './types'

class MfgApp {
    root: string

    config: AppConfig
    profileManager: MfgProfileManager
    projectManager: MfgProjectManager
    deviceManager: MfgDeviceManager
    launchManager: MfgLaunchManager

    constructor(root: string) {
        this.root = root

        this.config = {}
        this.profileManager = new MfgProfileManager()
        this.projectManager = new MfgProjectManager()
        this.deviceManager = new MfgDeviceManager()
        this.launchManager = new MfgLaunchManager()
    }

    async init() {
        await fs.mkdir(this.root, { recursive: true })

        await this.loadConfig()

        await this.profileManager.init()
        await this.projectManager.init()
        await this.deviceManager.init()
        await this.launchManager.init()
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
