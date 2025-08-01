import type { ProjectId } from './project'

export type MirrorcAppId = string & { __brand: 'MirrorcAppId' }

export type MirrorcAppInfo = {
    id: MirrorcAppId

    name: string

    rid: string

    expose?: {
        project: ProjectId
        version: string
    }
    meta?: {
        latest: string
    }
}
