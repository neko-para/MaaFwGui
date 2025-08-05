import { contextBridge, ipcRenderer, webUtils } from 'electron'

const ipc = {
    invoke: (key: string, ...args: unknown[]) => {
        return ipcRenderer.invoke(key, ...args)
    },
    on: (key: string, func: (id: number, ...args: unknown[]) => void) => {
        const wrapFunc = (event: Electron.IpcRendererEvent, id: number, ...args: unknown[]) => {
            func(id, ...args)
        }
        ipcRenderer.on(key, wrapFunc)
        return () => {
            ipcRenderer.off(key, wrapFunc)
        }
    },
    resp: (id: number, result: unknown) => {
        ipcRenderer.send('main.resp', id, result)
    },
    resolveFile: (file: File) => {
        return webUtils.getPathForFile(file)
    }
}

contextBridge.exposeInMainWorld('ipc', ipc)
