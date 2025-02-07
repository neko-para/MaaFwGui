declare global {
    interface Window {
        ipc: {
            invoke: (key: string, ...args: unknown[]) => Promise<unknown>
            on: (key: string, func: (id: number, ...args: unknown[]) => void) => void
            resp: (id: number, result: unknown) => void
        }

        main: import('@mfg/types').RendererIpc['main']
        renderer: import('@mfg/types').RendererIpc['renderer']
    }
}

export {}
