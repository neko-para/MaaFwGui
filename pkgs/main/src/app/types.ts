import type { AdbDevice, GithubRepoInfo, GlobalConfig, ProfileInfo, ProjectInfo } from '@mfg/types'

export type AppConfig = {
    config?: GlobalConfig

    profiles?: ProfileInfo[]
    projects?: ProjectInfo[]
    devices?: AdbDevice[]
    github?: {
        repos?: GithubRepoInfo[]
    }
}
