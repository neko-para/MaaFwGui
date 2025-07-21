import * as maa from '@maaxyz/maa-node'
import { app } from 'electron'
import path from 'path'

import pkg from '../../../package.json'
import { mfgApp } from './app/app'
import './ipc'
import { initUtils } from './utils/hooks'
import { createWindow } from './window'

console.log(maa.Global.version, maa.AdbController.agent_path())

app.setAboutPanelOptions({
    applicationName: pkg.name,
    applicationVersion: pkg.version,
    iconPath: path.join(__dirname, '../renderer/assets/icon.png')
})

app.on('ready', async () => {
    createWindow()

    globalThis.main.misc.MaaFwVersion = () => maa.Global.version
    globalThis.main.misc.MaaFwGuiVersion = () => pkg.version
    globalThis.main.maa.ScanDevice = async () => {
        const devs = await maa.AdbController.find()
        return devs
            ? devs.map(x => ({
                  name: x[0],
                  address: x[2]
              }))
            : null
    }

    mfgApp.init()
    initUtils()
})

app.on('window-all-closed', () => {
    app.quit()
})
