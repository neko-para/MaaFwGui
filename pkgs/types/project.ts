import type { GithubRepoId } from './github'
import type { MirrorcAppId } from './mirrorc'

export type ProjectId = string & { __brand: 'ProjectId' }

export type ProjectManageType = 'external' | 'managed'

export type ProjectInfo = {
    id: ProjectId

    name: string

    type: ProjectManageType
    path: string

    githubId?: GithubRepoId
    mirrorcId?: MirrorcAppId

    channel?: 'stable' | 'beta' | 'alpha'
    version?: string
    github?: {
        owner: string
        repo: string
    }
    mirrorc?: {
        rid: string
    }
}
