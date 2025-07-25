window.main = new Proxy(
    {},
    {
        get(_, k1: string) {
            return new Proxy(
                {},
                {
                    get(_, k2: string) {
                        return (...args: unknown[]) => {
                            console.log(`main.${k1}.${k2}`)
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
                            console.log(`renderer.${k1}.${k2}`)
                            const result = await func(...args)
                            console.log(`renderer.${k1}.${k2} fin`)
                            window.ipc.resp(id, result)
                        })
                        return true
                    }
                }
            )
        }
    }
) as any
