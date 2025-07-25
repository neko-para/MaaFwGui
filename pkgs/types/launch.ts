import type * as maa from '@maaxyz/maa-node'

import type { ProfileId, StageId, TaskId } from './profile'

export type LaunchId = string & { __brand: 'LaunchId' }

export type LaunchInfo = {
    id: LaunchId

    status: LaunchStatus

    instance: {
        controller?: maa.ControllerBase
        resource?: maa.ResourceBase
        tasker?: maa.TaskerBase
    }
}

export type LaunchStatus = {
    profile: ProfileId
    stopped?: boolean
    prevStages?: StageId[]
    currStage?: StageId
    prevTasks?: TaskId[]
    currTask?: TaskId
}
