import type { ProjectId } from './project'

export type GithubRepoId = string & { __brand: 'GithubRepoId' }

export type GithubRepoInfo = {
    id: GithubRepoId

    name: string

    url: string
    owner: string
    repo: string

    expose?: {
        project: ProjectId
        version: string
    }
    update?: {
        version: string
    }
}
