import type { MaaLoaderOption } from '@mfg/maa'
import type { AdbDevice, GlobalConfig, ProfileInfo, ProjectInfo, SecretConfig } from '@mfg/types'

export type AppConfig = {
    maaOption?: MaaLoaderOption
    config?: GlobalConfig
    secConfig?: SecretConfig

    profiles?: ProfileInfo[]
    projects?: ProjectInfo[]
    devices?: AdbDevice[]
}
