import type { GlobalConfig } from './config'
import type { AdbDevice, AdbDeviceId } from './device'
import type { LaunchActiveOutput, LaunchId, LaunchStatus } from './launch'
import type { Interface } from './pi'
import type { ProfileId, ProfileInfo, StageId, StageInfo, TaskId, TaskInfo } from './profile'
import type { ProjectId, ProjectInfo } from './project'

export type KnownPlatform = 'win32' | 'linux' | 'darwin'
export type KnownArch = 'x64' | 'arm64'

export type SystemInfo = {
    platform: KnownPlatform
    arch: KnownArch
}

export type MainService = {
    'utils.querySystemInfo': () => SystemInfo
    'utils.queryConfig': () => GlobalConfig
    // 'utils.updateConfig': (cfg: Partial<GlobalConfig>) => void

    'misc.MaaFwGuiVersion': () => string
    'misc.MaaFwVersion': () => string
    'misc.toggleDebugMode': () => void
    'misc.revealData': () => void
    'misc.revealPath': (path: string) => boolean
    'misc.openDevTools': () => void

    'profile.query': () => ProfileInfo[]
    'profile.new': () => void
    'profile.del': (id: ProfileId) => void
    'profile.dup': (id: ProfileId) => void
    'profile.update': (id: ProfileId, cfg: Partial<ProfileInfo>) => void

    'stage.new': (id: ProfileId) => void
    'stage.del': (id: ProfileId, sid: StageId) => void
    'stage.dup': (id: ProfileId, sid: StageId) => void
    'stage.update': (id: ProfileId, sid: StageId, cfg: Partial<StageInfo>) => void
    'stage.move': (id: ProfileId, sid: StageId, sidTgt: StageId, before: boolean) => void

    'task.new': (id: ProfileId, sid: StageId) => void
    'task.del': (id: ProfileId, sid: StageId, tid: TaskId) => void
    'task.dup': (id: ProfileId, sid: StageId, tid: TaskId) => void
    'task.update': (id: ProfileId, sid: StageId, tid: TaskId, cfg: Partial<TaskInfo>) => void
    'task.move': (id: ProfileId, sid: StageId, tid: TaskId, tidTgt: TaskId, before: boolean) => void

    'launch.new': (id: ProfileId) => void
    'launch.stop': (lid: LaunchId) => void
    'launch.del': (lid: LaunchId) => void
    'launch.syncIndex': () => Record<ProfileId, LaunchId>
    'launch.syncStatus': () => Record<LaunchId, LaunchStatus>

    'project.query': () => ProjectInfo[]
    'project.newExternal': () => boolean
    'project.newArchive': (files?: string[]) => boolean
    'project.newGithub': (url: string) => boolean
    'project.newMirrorc': (rid: string) => boolean
    'project.update': (id: ProjectId, cfg: Partial<ProjectInfo>) => void
    'project.del': (id: ProjectId) => boolean
    'project.delGithub': (id: ProjectId) => boolean
    'project.bindGithub': (id: ProjectId, url: string) => boolean
    'project.delMirrorc': (id: ProjectId) => boolean
    'project.bindMirrorc': (id: ProjectId, rid: string) => boolean
    'project.checkUpdate': (id: ProjectId, via: 'github' | 'mirrorc') => boolean
    'project.load': (id: ProjectId) => ProjectInfo | null
    'project.loadInterface': (id: ProjectId) => Interface | null

    'device.query': () => AdbDevice[]
    'device.del': (did: AdbDeviceId) => void
    'device.scan': () => AdbDevice[]

    'github.hasToken': () => boolean
    'github.tryUpdateToken': (token: string) => boolean
    'github.cleanToken': () => void

    'mirrorc.hasToken': () => boolean
    'mirrorc.tryUpdateToken': (token: string) => boolean
    'mirrorc.cleanToken': () => void
}

export type RendererService = {
    'launch.updateIndex': (index: Record<ProfileId, LaunchId>) => void
    'launch.updateStatus': (lid: LaunchId, status?: LaunchStatus) => void
    'launch.addOutput': (
        lid: LaunchId,
        sid: StageId,
        type: 'agent' | 'focus',
        output: string
    ) => void
    'launch.setActiveOutput': (lid: LaunchId, output: LaunchActiveOutput) => void

    'utils.showToast': (category: 'info' | 'warning' | 'error' | 'success', message: string) => void
    'utils.showProgress': (id: string, stage: string, progress?: number) => void
    'utils.endProgress': (id: string) => void

    'project.updateFound': (version: string, notes: string) => boolean
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
