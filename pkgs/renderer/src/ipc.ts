window.main = new Proxy(
    {},
    {
        get(_, k1: string) {
            return new Proxy(
                {},
                {
                    get(_, k2: string) {
                        return (...args: unknown[]) => {
                            return window.ipc.invoke(`main.${k1}.${k2}`, ...args)
                        }
                    }
                }
            )
        }
    }
) as any

window.renderer = new Proxy(
    {},
    {
        get(_, k1: string) {
            return new Proxy(
                {},
                {
                    set(_, k2: string, func: (...args: any[]) => any) {
                        window.ipc.on(`renderer.${k1}.${k2}`, async (id, ...args) => {
                            const result = await func(...args)
                            window.ipc.resp(id, result)
                        })
                        return true
                    }
                }
            )
        }
    }
) as any
