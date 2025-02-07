import { contextBridge, ipcRenderer } from 'electron'

const ipc = {
    invoke: (key: string, ...args: unknown[]) => {
        return ipcRenderer.invoke(key, ...args)
    },
    on: (key: string, func: (id: number, ...args: unknown[]) => void) => {
        ipcRenderer.on(key, (event, id, ...args) => {
            func(id, ...args)
        })
    },
    resp: (id: number, result: unknown) => {
        ipcRenderer.send('main.resp', id, result)
    }
}

contextBridge.exposeInMainWorld('ipc', ipc)
