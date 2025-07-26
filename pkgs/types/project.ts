export type ProjectId = string & { __brand: 'ProjectId' }

export type ProjectManageType = 'external' | 'managed'

export type ManagedProjectInfo = {
    type: 'githubRepo'
    url: string
}

export type ProjectInfo = {
    id: ProjectId

    name: string

    type: ProjectManageType
    path: string

    managed?: {
        path: string
    } & ManagedProjectInfo
}
