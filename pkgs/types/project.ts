import type { MirrorcAppId } from './mirrorc'

export type ProjectId = string & { __brand: 'ProjectId' }

export type ProjectManageType = 'external' | 'managed'

export type ProjectUpdateChannel = 'stable' | 'beta' | 'alpha'

export type ProjectInfo = {
    id: ProjectId

    name: string

    type: ProjectManageType
    path: string

    mirrorcId?: MirrorcAppId

    version?: string
    channel?: ProjectUpdateChannel
    github?: {
        owner: string
        repo: string
    }
    mirrorc?: {
        rid: string
    }
}
