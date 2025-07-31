import * as maa from '@maaxyz/maa-node'
import { SystemInfo } from '@mfg/types'
import { app, shell } from 'electron'
import { existsSync, statSync } from 'fs'
import fs from 'fs/promises'
import path from 'path'

import pkg from '../../../../package.json'
import { MfgDeviceManager } from './deviceManager'
import { MfgGithubManager } from './githubManager'
import { MfgLaunchManager } from './launchManager'
import { MfgMirrorcManager } from './mirrorcManager'
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
    githubManager: MfgGithubManager
    mirrorcManager: MfgMirrorcManager

    constructor(root: string) {
        this.root = root

        this.config = {}
        this.profileManager = new MfgProfileManager()
        this.projectManager = new MfgProjectManager()
        this.deviceManager = new MfgDeviceManager()
        this.launchManager = new MfgLaunchManager()
        this.githubManager = new MfgGithubManager()
        this.mirrorcManager = new MfgMirrorcManager()
    }

    async init() {
        await fs.mkdir(this.root, { recursive: true })

        await this.loadConfig()

        this.initUtils()
        this.initMiscs()

        await this.profileManager.init()
        await this.projectManager.init()
        await this.deviceManager.init()
        await this.launchManager.init()
        await this.githubManager.init()
        await this.mirrorcManager.init()
    }

    initUtils() {
        globalThis.main.utils.querySystemInfo = () => ({
            platform: process.platform as SystemInfo['platform'],
            arch: process.arch as SystemInfo['arch']
        })

        globalThis.main.utils.queryConfig = () => {
            return this.config.config ?? {}
        }
        // globalThis.main.utils.updateConfig = async cfg => {
        //     this.config.config = this.config.config ?? {}
        //     Object.assign(this.config.config, cfg)
        //     await this.saveConfig()
        // }
    }

    initMiscs() {
        globalThis.main.misc.MaaFwVersion = () => maa.Global.version
        globalThis.main.misc.MaaFwGuiVersion = () => pkg.version

        globalThis.main.misc.revealData = async () => {
            await shell.openPath(this.root)
        }
        globalThis.main.misc.revealPath = async p => {
            if (!existsSync(p)) {
                return false
            }
            if (statSync(p).isFile()) {
                await shell.openPath(path.dirname(p))
            } else {
                await shell.openPath(p)
            }
            return true
        }
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
