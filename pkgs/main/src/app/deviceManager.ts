import * as maa from '@maaxyz/maa-node'
import { AdbDevice, AdbDeviceId } from '@mfg/types'

import { generateId } from '../utils/uuid'
import { mfgApp } from './app'

export class MfgDeviceManager {
    async init() {
        globalThis.main.device.query = () => {
            return mfgApp.config.devices ?? []
        }

        globalThis.main.device.scan = async () => {
            mfgApp.config.devices = mfgApp.config.devices ?? []

            const devs = await maa.AdbController.find()
            const newDevs: AdbDevice[] = []
            for (const dev of devs ?? []) {
                const prev = mfgApp.config.devices.find(d => {
                    return d.adb_path === dev[1] && d.address === dev[2]
                })
                if (!prev) {
                    newDevs.push({
                        id: generateId(),

                        name: dev[0],
                        adb_path: dev[1],
                        address: dev[2],
                        screencap_methods: dev[3],
                        input_methods: dev[4],
                        config: dev[5]
                    })
                } else {
                    prev.name = dev[0]
                    prev.screencap_methods = dev[3]
                    prev.input_methods = dev[4]
                    prev.config = dev[5]
                }
            }
            mfgApp.config.devices.push(...newDevs)
            await mfgApp.saveConfig()
            return mfgApp.config.devices
        }
    }
}
