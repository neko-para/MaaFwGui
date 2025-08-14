import { maa } from '@mfg/maa'
import { AdbDevice, AdbDeviceId, ProfileId, StageId } from '@mfg/types'

import { generateId } from '../utils/uuid'
import { mfgApp } from './app'

export class MfgDeviceManager {
    async init() {
        globalThis.main.device.query = () => {
            return mfgApp.config.devices ?? []
        }
        globalThis.main.device.del = async id => {
            mfgApp.config.devices = mfgApp.config.devices ?? []
            const devIndex = mfgApp.config.devices.findIndex(x => x.id === id)
            if (devIndex === -1) {
                globalThis.renderer.utils.showToast('error', '未找到指定设备')
                return
            }

            for (const profile of mfgApp.config.profiles ?? []) {
                for (const stage of profile.stages) {
                    if (stage.adb === id) {
                        globalThis.renderer.utils.showToast('error', '设备已被引用')
                        return
                    }
                }
            }

            mfgApp.config.devices.splice(devIndex, 1)
            await mfgApp.saveConfig()
        }
        globalThis.main.device.update = async (id, cfg) => {
            const dev = mfgApp.config.devices?.find(x => x.id === id)
            if (!dev) {
                globalThis.renderer.utils.showToast('error', '未找到指定设备')
                return
            }

            Object.assign(dev, cfg)
            await mfgApp.saveConfig()
        }
        globalThis.main.device.queryRef = async id => {
            mfgApp.config.devices = mfgApp.config.devices ?? []
            const devIndex = mfgApp.config.devices.findIndex(x => x.id === id)
            if (devIndex === -1) {
                globalThis.renderer.utils.showToast('error', '未找到指定设备')
                return []
            }

            const result: [ProfileId, StageId][] = []

            for (const profile of mfgApp.config.profiles ?? []) {
                for (const stage of profile.stages) {
                    if (stage.adb === id) {
                        result.push([profile.id, stage.id])
                    }
                }
            }

            return result
        }
        globalThis.main.device.scan = async () => {
            if (!maa) {
                globalThis.renderer.utils.showToast('error', '未加载MaaFramework')
                return []
            }

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
