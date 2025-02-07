import * as maa from '@maaxyz/maa-node'
import { SystemInfo } from '@mfg/types'
import { app } from 'electron'

import pkg from '../../../package.json'
import './ipc'
import { createWindow } from './window'

console.log(maa.Global.version, maa.AdbController.agent_path())

app.setAboutPanelOptions({
    applicationName: pkg.name,
    applicationVersion: pkg.version
    // iconPath: path.join(__dirname, '../renderer/assets/icon.png')
})

app.on('ready', async () => {
    createWindow()

    globalThis.main.utils.SystemInfo = () => ({
        platform: process.platform as SystemInfo['platform']
    })
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
})

app.on('window-all-closed', () => {
    app.quit()
})
