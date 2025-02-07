import * as maa from '@maaxyz/maa-node'
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

    globalThis.main.misc.MaaFwVersion = () => maa.Global.version
    globalThis.main.misc.MaaFwGuiVersion = () => pkg.version
})

app.on('window-all-closed', () => {
    app.quit()
})
