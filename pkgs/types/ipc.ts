import type * as maa from '@maaxyz/maa-node'

import type { ProjectId, ProjectInfo } from './project'

export type SystemInfo = {
    platform: 'win32' | 'linux' | 'darwin'
}

export type AdbDevice = {
    name: string
    address: string
}

export type Interface = {
    controller: {
        name: string
        type: 'Adb' | 'Win32' | 'VscFixed'
        adb?: {
            screencap?: maa.api.ScreencapOrInputMethods
            input?: maa.api.ScreencapOrInputMethods
            config?: unknown
        }
        win32?: {
            class_regex?: string
            window_regex?: string
            screencap?: maa.api.ScreencapOrInputMethods
            input?: maa.api.ScreencapOrInputMethods
        }
    }[]
    resource: {
        name: string
        path: string | string[]
    }[]
    task: {
        name: string
        entry: string
        pipeline_override?: unknown
        option?: string[]
    }[]
    option?: Record<
        string,
        {
            cases: {
                name: string
                pipeline_override?: unknown
            }[]
            default_case?: string
        }
    >
    version?: string
    message?: string
    agent?: {
        child_exec?: string
        child_args?: string[]
        identifier?: string
    }
}

export type MainService = {
    'utils.generateId': () => string
    'utils.querySystemInfo': () => SystemInfo

    'misc.MaaFwGuiVersion': () => string
    'misc.MaaFwVersion': () => string

    'maa.ScanDevice': () => AdbDevice[] | null

    'project.query': () => ProjectInfo[]
    'project.new': () => void
    'project.load': (id: ProjectId) => Interface | null
}

export type RendererService = {}

type Get<O, K extends string> = K extends keyof O ? O[K] : never
type MethodCategory<K extends string> = K extends `${infer C}.${infer N}` ? C : never
// type MethodName<K extends string> = K extends `${infer C}.${infer N}` ? N : never
type MethodsOfCategory<K extends string, C extends string> = K extends `${C}.${infer N}` ? N : never
type Promisify<F extends (...args: any[]) => any> = (
    ...args: Parameters<F>
) => Promise<ReturnType<F>>
type MaybePromisify<F extends (...args: any[]) => any> = (
    ...args: Parameters<F>
) => Promise<ReturnType<F>> | ReturnType<F>

export type MainIpc = {
    main: {
        [C in MethodCategory<keyof MainService>]: {
            [N in MethodsOfCategory<keyof MainService, C>]: MaybePromisify<
                Get<MainService, `${C}.${N}`>
            >
        }
    }
    renderer: {
        [C in MethodCategory<keyof RendererService>]: {
            readonly [N in MethodsOfCategory<keyof RendererService, C>]: Promisify<
                Get<RendererService, `${C}.${N}`>
            >
        }
    }
}

export type RendererIpc = {
    main: {
        [C in MethodCategory<keyof MainService>]: {
            readonly [N in MethodsOfCategory<keyof MainService, C>]: Promisify<
                Get<MainService, `${C}.${N}`>
            >
        }
    }
    renderer: {
        [C in MethodCategory<keyof RendererService>]: {
            [N in MethodsOfCategory<keyof RendererService, C>]: MaybePromisify<
                Get<RendererService, `${C}.${N}`>
            >
        }
    }
}
