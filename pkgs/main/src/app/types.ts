import type { AdbDevice, InterfaceConfig, ProfileInfo, ProjectInfo } from '@mfg/types'

export type AppConfig = {
    profiles?: ProfileInfo[]

    projects?: ProjectInfo[]
    projectConfigs?: Record<string, InterfaceConfig>

    devices?: AdbDevice[]
}
