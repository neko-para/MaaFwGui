import { app } from 'electron'
import path from 'path'

import pkg from '../../../package.json'
import { mfgApp } from './app/app'
import './ipc'
import { createWindow } from './window'

app.setAboutPanelOptions({
    applicationName: pkg.name,
    applicationVersion: pkg.version,
    iconPath: path.join(__dirname, '../renderer/assets/icon.png')
})

app.on('ready', async () => {
    createWindow()

    mfgApp.init()
})

app.on('window-all-closed', () => {
    app.quit()
})
