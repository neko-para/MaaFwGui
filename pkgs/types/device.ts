import type * as maa from '@maaxyz/maa-node'

export type AdbDeviceId = string & { __brand: 'AdbDeviceId' }

export type AdbDevice = {
    id: AdbDeviceId

    name: string
    adb_path: string
    address: string
    screencap_methods: maa.api.ScreencapOrInputMethods
    input_methods: maa.api.ScreencapOrInputMethods
    config: string
}
