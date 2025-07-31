import type {
    AdbDevice,
    GithubRepoInfo,
    GlobalConfig,
    ProfileInfo,
    ProjectInfo,
    SecretConfig
} from '@mfg/types'

export type AppConfig = {
    config?: GlobalConfig
    secConfig?: SecretConfig

    profiles?: ProfileInfo[]
    projects?: ProjectInfo[]
    devices?: AdbDevice[]
    github?: {
        repos?: GithubRepoInfo[]
    }
}
