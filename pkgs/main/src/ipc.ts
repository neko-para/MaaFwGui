import { ipcMain } from 'electron'

import { window } from './window'

let ipcCounter = 0
const ipcResp: Partial<Record<number, (resp: unknown) => void>> = {}

ipcMain.on('main.resp', (_, id: number, resp: unknown) => {
    ipcResp[id]?.(resp)
    delete ipcResp[id]
})

globalThis.main = new Proxy(
    {},
    {
        get(_, k1: string) {
            return new Proxy(
                {},
                {
                    set(_, k2: string, func: (...args: any[]) => any) {
                        ipcMain.handle(`main.${k1}.${k2}`, async (event, ...args) => {
                            console.log(`main.${k1}.${k2}`)
                            return func(...args)
                        })
                        return true
                    }
                }
            )
        }
    }
) as any

globalThis.renderer = new Proxy(
    {},
    {
        get(_, k1: string) {
            return new Proxy(
                {},
                {
                    get(_, k2: string) {
                        return (...args: unknown[]) => {
                            return new Promise<unknown>(resolve => {
                                const id = ipcCounter++
                                ipcResp[id] = resolve
                                console.log(`renderer.${k1}.${k2}`)
                                window.webContents.send(`renderer.${k1}.${k2}`, id, ...args)
                            })
                        }
                    }
                }
            )
        }
    }
) as any
