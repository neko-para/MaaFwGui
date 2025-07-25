import type { AdbDevice, ProfileInfo, ProjectInfo } from '@mfg/types'

export type AppConfig = {
    profiles?: ProfileInfo[]

    projects?: ProjectInfo[]

    devices?: AdbDevice[]
}
