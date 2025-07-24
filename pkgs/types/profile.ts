import type { AdbDeviceId } from './device'
import type { ProjectId } from './project'

export type ProfileId = string & { __brand: 'ProfileId' }
export type StageId = string & { __brand: 'StageId' }
export type TaskId = string & { __brand: 'TaskId' }

export type ProfileInfo = {
    id: ProfileId

    name: string

    stages: StageInfo[]
}

export type StageInfo = {
    id: StageId

    name: string

    project?: ProjectId

    resource?: string
    controller?: string

    adb?: AdbDeviceId

    tasks?: TaskInfo[]
}

export type TaskInfo = {
    id: TaskId

    task?: string
    option?: Record<string, string>
}
