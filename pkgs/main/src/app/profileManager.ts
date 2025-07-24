import { ProfileId, ProfileInfo, StageId } from '@mfg/types'

import { generateId } from '../utils/uuid'
import { mfgApp } from './app'

export class MfgProfileManager {
    async init() {
        globalThis.main.profile.query = () => {
            return mfgApp.config.profiles ?? []
        }
        globalThis.main.profile.new = async () => {
            const profile: ProfileInfo = {
                id: generateId() as ProfileId,
                name: '<未命名方案>',
                stages: []
            }
            mfgApp.config.profiles = [...(mfgApp.config.profiles ?? []), profile]
            await mfgApp.saveConfig()
        }
        globalThis.main.profile.del = async id => {
            const profileIndex = mfgApp.config.profiles?.findIndex(p => p.id === id) ?? -1
            if (profileIndex === -1) {
                return
            }
            mfgApp.config.profiles?.splice(profileIndex, 1)
            await mfgApp.saveConfig()
        }
        globalThis.main.profile.update = async (id, cfg) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                return
            }
            Object.assign(profile, cfg)
            await mfgApp.saveConfig()
        }

        globalThis.main.stage.new = async id => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                return
            }
            profile.stages.push({
                id: generateId() as StageId,
                name: '<未命名步骤>'
            })
            await mfgApp.saveConfig()
        }
        globalThis.main.stage.del = async (id, sid) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                return
            }
            const stageIdx = profile.stages.findIndex(s => s.id === sid)
            if (stageIdx === -1) {
                return
            }
            profile.stages.splice(stageIdx, 1)
            await mfgApp.saveConfig()
        }
        globalThis.main.stage.update = async (id, sid, cfg) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                return
            }
            const stage = profile.stages.find(s => s.id === sid)
            if (!stage) {
                return
            }
            Object.assign(stage, cfg)
            await mfgApp.saveConfig()
        }
    }
}
