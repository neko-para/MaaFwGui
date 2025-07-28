import type { AdbDevice, GithubRepoInfo, ProfileInfo, ProjectInfo } from '@mfg/types'

export type AppConfig = {
    profiles?: ProfileInfo[]
    projects?: ProjectInfo[]
    devices?: AdbDevice[]
    github?: {
        authToken?: string

        repos?: GithubRepoInfo[]
    }
}
