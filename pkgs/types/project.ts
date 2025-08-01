import type { GithubRepoId } from './github'
import type { MirrorcAppId } from './mirrorc'

export type ProjectId = string & { __brand: 'ProjectId' }

export type ProjectManageType = 'external' | 'managed'

export type ProjectInfo = {
    id: ProjectId

    name: string

    type: ProjectManageType
    path: string

    github?: GithubRepoId
    mirrorc?: MirrorcAppId
}
