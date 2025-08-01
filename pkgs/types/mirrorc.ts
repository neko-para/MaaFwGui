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
        // 最新的已下载版本, 用于增量
        latestDone?: string

        tarballs?: {
            version: string
            version_from?: string
            filename: string
        }[]
    }
}
