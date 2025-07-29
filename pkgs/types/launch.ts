import type * as maa from '@maaxyz/maa-node'
import type * as child_process from 'node:child_process'

import type { ProfileId, StageId, TaskId } from './profile'

export type LaunchId = string & { __brand: 'LaunchId' }

export type LaunchInfo = {
    id: LaunchId

    status: LaunchStatus

    instance: {
        controller?: maa.ControllerBase
        resource?: maa.ResourceBase
        tasker?: maa.TaskerBase
        client?: maa.AgentClient
        agent?: child_process.ChildProcess

        postStop?: Promise<boolean>
    }
}

export type Status = 'running' | 'succeeded' | 'failed'

export type LaunchStatus = {
    profile: ProfileId
    stopped?: boolean

    // not exists means `pending`
    stages: Record<StageId, Status>
    tasks: Record<TaskId | StageId, Status>
}
