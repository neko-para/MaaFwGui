import type * as maa from '@maaxyz/maa-node'

export type Interface = {
    name?: string
    version?: string
    mirrorchyan_rid?: string
    url?: string

    controller: {
        name: string
        type: 'Adb' | 'Win32'
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
    agent?: {
        child_exec?: string
        child_args?: string[]
    }
}
