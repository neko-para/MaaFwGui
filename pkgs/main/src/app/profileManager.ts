import { ProfileId, ProfileInfo, StageId, TaskId, TaskInfo } from '@mfg/types'

import { generateId } from '../utils/uuid'
import { mfgApp } from './app'

export class MfgProfileManager {
    async init() {
        globalThis.main.profile.query = () => {
            return mfgApp.config.profiles ?? []
        }
        globalThis.main.profile.new = async () => {
            const profile: ProfileInfo = {
                id: generateId(),
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
                id: generateId(),
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

        globalThis.main.task.new = async (id, sid) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                return
            }
            const stage = profile.stages.find(s => s.id === sid)
            if (!stage) {
                return
            }
            const task: TaskInfo = {
                id: generateId()
            }
            stage.tasks = [...(stage.tasks ?? []), task]
            await mfgApp.saveConfig()
        }
        globalThis.main.task.del = async (id, sid, tid) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                return
            }
            const stage = profile.stages.find(s => s.id === sid)
            if (!stage) {
                return
            }
            const taskIdx = stage.tasks?.findIndex(t => t.id === tid) ?? -1
            if (taskIdx === -1) {
                return
            }
            stage.tasks?.splice(taskIdx, 1)
            await mfgApp.saveConfig()
        }
        globalThis.main.task.update = async (id, sid, tid, cfg) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                return
            }
            const stage = profile.stages.find(s => s.id === sid)
            if (!stage) {
                return
            }
            const task = stage.tasks?.find(t => t.id === tid)
            if (!task) {
                return
            }
            Object.assign(task, cfg)
            await mfgApp.saveConfig()
        }
    }
}
