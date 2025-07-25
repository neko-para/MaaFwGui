import { BrowserWindow, app } from 'electron'
// import { VUEJS_DEVTOOLS, default as installExtension } from 'electron-devtools-installer'
import { VUEJS_DEVTOOLS, installExtension } from 'electron-extension-installer'
import path from 'path'

export let window: BrowserWindow

export function createWindow() {
    window = new BrowserWindow({
        width: 1024,
        height: 768,
        minWidth: 800,
        minHeight: 600,
        titleBarStyle: 'hidden',
        titleBarOverlay: process.platform === 'win32' || process.platform === 'linux',
        webPreferences: {
            preload: path.join(__dirname, '../preload/main.js')
        },
        icon: path.join(__dirname, '../renderer/assets/icon.png')
    })

    if (app.isPackaged) {
        window.loadFile(path.join(__dirname, '../renderer/index.html'))
    } else {
        window.loadURL(
            `http://${process.env.VITE_DEV_SERVER_HOST}:${process.env.VITE_DEV_SERVER_PORT}`
        )
        window.webContents.on('did-frame-finish-load', () => {
            window.webContents.openDevTools()
        })
    }

    installExtension(VUEJS_DEVTOOLS, {
        loadExtensionOptions: {
            allowFileAccess: true
        }
    }).then(
        ext => {
            console.log('install done', ext)
        },
        err => {
            console.log('install failed', err)
        }
    )
}
