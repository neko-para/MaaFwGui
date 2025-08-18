import { AdbDevice, Interface, LaunchInfo, StageInfo } from '@mfg/types'

export let interfaceData: Interface
export let launch: LaunchInfo
export let stage: StageInfo
export let projectDir: string
export let dev: AdbDevice | undefined

export function parseData() {
    interfaceData = JSON.parse(process.env['MFG_INTERFACE']!)
    launch = JSON.parse(process.env['MFG_LAUNCH']!)
    stage = JSON.parse(process.env['MFG_STAGE']!)
    projectDir = process.env['MFG_PROJECT_DIR']!
    if (process.env['MFG_DEV']) {
        dev = JSON.parse(process.env['MFG_DEV'])
    }
}
