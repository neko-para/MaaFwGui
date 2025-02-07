export type MainService = {
    'misc.MaaFwGuiVersion': () => string
    'misc.MaaFwVersion': () => string
}

export type RendererService = {}

type MethodCategory<K extends string> = K extends `${infer C}.${infer N}` ? C : never
// type MethodName<K extends string> = K extends `${infer C}.${infer N}` ? N : never
type MethodsOfCategory<K extends string, C extends string> = K extends `${C}.${infer N}` ? N : never
type Promisify<F extends (...args: unknown[]) => unknown> = (
    ...args: Parameters<F>
) => Promise<ReturnType<F>>
type MaybePromisify<F extends (...args: unknown[]) => unknown> = (
    ...args: Parameters<F>
) => Promise<ReturnType<F>> | ReturnType<F>

export type MainIpc = {
    main: {
        [C in MethodCategory<keyof MainService>]: {
            [N in MethodsOfCategory<keyof MainService, C>]: MaybePromisify<MainService[`${C}.${N}`]>
        }
    }
    renderer: {
        [C in MethodCategory<keyof RendererService>]: {
            readonly [N in MethodsOfCategory<keyof RendererService, C>]: Promisify<
                RendererService[`${C}.${N}`]
            >
        }
    }
}

export type RendererIpc = {
    main: {
        [C in MethodCategory<keyof MainService>]: {
            readonly [N in MethodsOfCategory<keyof MainService, C>]: Promisify<
                MainService[`${C}.${N}`]
            >
        }
    }
    renderer: {
        [C in MethodCategory<keyof RendererService>]: {
            [N in MethodsOfCategory<keyof RendererService, C>]: MaybePromisify<
                RendererService[`${C}.${N}`]
            >
        }
    }
}
