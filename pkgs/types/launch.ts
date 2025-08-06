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

        stopped: [Promise<null>, (v: null) => void]
        postStop?: Promise<boolean>
        postConn?: Promise<boolean>

        currentTask?: string
    }
}

export type Status = 'running' | 'succeeded' | 'failed'

export type LaunchPrepareStatus = {
    stage: string
    status?: Status
}

export type LaunchStatus = {
    profile: ProfileId
    stopped?: boolean
    hasAgent?: boolean

    // not exists means `pending`
    stages: Record<StageId, Status>
    prepares: LaunchPrepareStatus[]
    tasks: Record<TaskId, Status>
}

export type LaunchActiveOutput =
    | {
          type: 'agent'
          stage: StageId
      }
    | {
          type: 'focus'
          stage: StageId
      }
