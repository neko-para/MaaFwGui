import type * as maa from '@maaxyz/maa-node'

import type { GlobalConfig } from './config'
import type { AdbDevice } from './device'
import type { GithubRepoId, GithubRepoInfo } from './github'
import type { LaunchId, LaunchStatus } from './launch'
import type { MirrorcAppId, MirrorcAppInfo } from './mirrorc'
import type { ProfileId, ProfileInfo, StageId, StageInfo, TaskId, TaskInfo } from './profile'
import type { ProjectId, ProjectInfo } from './project'

export type KnownPlatform = 'win32' | 'linux' | 'darwin'
export type KnownArch = 'x64' | 'arm64'

export type SystemInfo = {
    platform: KnownPlatform
    arch: KnownArch
}

export type Interface = {
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
    version?: string
    message?: string
    agent?: {
        child_exec?: string
        child_args?: string[]
    }
}

export type MainService = {
    'utils.querySystemInfo': () => SystemInfo
    'utils.queryConfig': () => GlobalConfig
    // 'utils.updateConfig': (cfg: Partial<GlobalConfig>) => void

    'misc.MaaFwGuiVersion': () => string
    'misc.MaaFwVersion': () => string
    'misc.revealData': () => void
    'misc.revealPath': (path: string) => boolean

    'profile.query': () => ProfileInfo[]
    'profile.new': () => void
    'profile.del': (id: ProfileId) => void
    'profile.update': (id: ProfileId, cfg: Partial<ProfileInfo>) => void

    'stage.new': (id: ProfileId) => void
    'stage.del': (id: ProfileId, sid: StageId) => void
    'stage.update': (id: ProfileId, sid: StageId, cfg: Partial<StageInfo>) => void
    'stage.move': (id: ProfileId, sid: StageId, sidTgt: StageId, before: boolean) => void

    'task.new': (id: ProfileId, sid: StageId) => void
    'task.del': (id: ProfileId, sid: StageId, tid: TaskId) => void
    'task.update': (id: ProfileId, sid: StageId, tid: TaskId, cfg: Partial<TaskInfo>) => void
    'task.move': (id: ProfileId, sid: StageId, tid: TaskId, tidTgt: TaskId, before: boolean) => void

    'launch.new': (id: ProfileId) => void
    'launch.stop': (lid: LaunchId) => void
    'launch.del': (lid: LaunchId) => void
    'launch.syncIndex': () => Record<ProfileId, LaunchId>
    'launch.syncStatus': () => Record<LaunchId, LaunchStatus>

    'project.query': () => ProjectInfo[]
    'project.newExternal': () => boolean
    'project.del': (id: ProjectId) => boolean
    'project.load': (id: ProjectId) => ProjectInfo | null
    'project.loadInterface': (id: ProjectId) => Interface | null

    'device.query': () => AdbDevice[]
    'device.scan': () => AdbDevice[]

    'github.hasToken': () => boolean
    'github.tryUpdateToken': (token: string) => boolean
    'github.cleanToken': () => void
    'github.queryRepo': () => GithubRepoInfo[]
    'github.newRepo': (url: string) => boolean
    'github.delRepo': (id: GithubRepoId) => boolean
    'github.checkRepoUpdate': (id: GithubRepoId) => boolean
    'github.exportRepo': (id: GithubRepoId, tag: string) => boolean

    'mirrorc.hasToken': () => boolean
    'mirrorc.tryUpdateToken': (token: string) => boolean
    'mirrorc.cleanToken': () => void
    'mirrorc.queryApp': () => MirrorcAppInfo[]
    'mirrorc.newApp': (rid: string) => boolean
    'mirrorc.delApp': (id: MirrorcAppId) => boolean
    'mirrorc.checkAppUpdate': (id: MirrorcAppId) => boolean
    'mirrorc.exportApp': (id: MirrorcAppId) => boolean
}

export type RendererService = {
    'launch.updateIndex': (index: Record<ProfileId, LaunchId>) => void
    'launch.updateStatus': (lid: LaunchId, status?: LaunchStatus) => void

    'utils.showToast': (category: 'info' | 'warning' | 'error' | 'success', message: string) => void
}

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
            [N in MethodsOfCategory<keyof RendererService, C>]: (
                func: MaybePromisify<Get<RendererService, `${C}.${N}`>>
            ) => () => void
        }
    }
}
