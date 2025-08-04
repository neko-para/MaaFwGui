import type {
    AdbDevice,
    GlobalConfig,
    MirrorcAppInfo,
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
    mirrorc?: {
        apps?: MirrorcAppInfo[]
    }
}
