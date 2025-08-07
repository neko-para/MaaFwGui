import { ProfileId, ProfileInfo, StageId, StageInfo, TaskId, TaskInfo } from '@mfg/types'

import { generateId } from '../utils/uuid'
import { mfgApp } from './app'

function cloneTask(task: TaskInfo) {
    const newTask = {
        ...task
    }

    newTask.id = generateId()
    newTask.option = task.option
        ? {
              ...task.option
          }
        : undefined

    return newTask
}

function cloneStage(stage: StageInfo, rename?: boolean) {
    const newStage = {
        ...stage
    }

    newStage.id = generateId()
    newStage.name = rename && newStage.name.length > 0 ? `${newStage.name} 复制` : newStage.name
    newStage.tasks = stage.tasks?.map(task => cloneTask(task))

    return newStage
}

function cloneProfile(profile: ProfileInfo, rename?: boolean) {
    const newProfile = {
        ...profile
    }

    newProfile.id = generateId()
    newProfile.name = rename && profile.name.length > 0 ? `${profile.name} 复制` : profile.name
    newProfile.stages = profile.stages.map(stage => cloneStage(stage))

    return newProfile
}

export class MfgProfileManager {
    async init() {
        globalThis.main.profile.query = () => {
            return mfgApp.config.profiles ?? []
        }
        globalThis.main.profile.new = async () => {
            const profile: ProfileInfo = {
                id: generateId(),
                name: '',
                stages: []
            }
            mfgApp.config.profiles = [...(mfgApp.config.profiles ?? []), profile]
            await mfgApp.saveConfig()
        }
        globalThis.main.profile.del = async id => {
            const profileIndex = mfgApp.config.profiles?.findIndex(p => p.id === id) ?? -1
            if (profileIndex === -1) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return
            }

            if (mfgApp.launchManager.launchIndex[id]) {
                globalThis.renderer.utils.showToast('error', '方案正在执行中')
                return
            }

            mfgApp.config.profiles?.splice(profileIndex, 1)
            await mfgApp.saveConfig()
        }
        globalThis.main.profile.dup = async id => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return
            }

            mfgApp.config.profiles!.push(cloneProfile(profile, true))
            await mfgApp.saveConfig()
        }
        globalThis.main.profile.update = async (id, cfg) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return
            }
            Object.assign(profile, cfg)
            await mfgApp.saveConfig()
        }

        globalThis.main.stage.new = async id => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return null
            }

            const stage: StageInfo = {
                id: generateId(),
                name: ''
            }
            profile.stages.push(stage)
            await mfgApp.saveConfig()
            return stage.id
        }
        globalThis.main.stage.del = async (id, sid) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return
            }
            const stageIdx = profile.stages.findIndex(s => s.id === sid)
            if (stageIdx === -1) {
                globalThis.renderer.utils.showToast('error', '未找到指定步骤')
                return
            }
            profile.stages.splice(stageIdx, 1)
            await mfgApp.saveConfig()
        }
        globalThis.main.stage.dup = async (id, sid) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return
            }
            const stageIdx = profile.stages.findIndex(s => s.id === sid)
            if (stageIdx === -1) {
                globalThis.renderer.utils.showToast('error', '未找到指定步骤')
                return
            }

            profile.stages.splice(stageIdx + 1, 0, cloneStage(profile.stages[stageIdx], true))
            await mfgApp.saveConfig()
        }
        globalThis.main.stage.update = async (id, sid, cfg) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return
            }
            const stage = profile.stages.find(s => s.id === sid)
            if (!stage) {
                globalThis.renderer.utils.showToast('error', '未找到指定步骤')
                return
            }
            Object.assign(stage, cfg)
            await mfgApp.saveConfig()
        }
        globalThis.main.stage.move = async (id, sid, sidTgt, before) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return
            }
            const srcIdx = profile.stages.findIndex(s => s.id === sid) ?? -1
            if (srcIdx === -1) {
                globalThis.renderer.utils.showToast('error', '未找到指定步骤')
                return
            }

            const stage = profile.stages.splice(srcIdx, 1)[0]

            const dstIdx = profile.stages.findIndex(s => s.id === sidTgt) ?? -1
            if (dstIdx === -1) {
                profile.stages.splice(srcIdx, 0, stage)
                globalThis.renderer.utils.showToast('error', '未找到指定步骤')
                return
            }

            profile.stages.splice(before ? dstIdx : dstIdx + 1, 0, stage)
            await mfgApp.saveConfig()
        }
        globalThis.main.task.new = async (id, sid) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return null
            }
            const stage = profile.stages.find(s => s.id === sid)
            if (!stage) {
                globalThis.renderer.utils.showToast('error', '未找到指定步骤')
                return null
            }
            stage.tasks = stage.tasks ?? []

            const task: TaskInfo = {
                id: generateId()
            }
            stage.tasks.push(task)
            await mfgApp.saveConfig()
            return task.id
        }
        globalThis.main.task.del = async (id, sid, tid) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return
            }
            const stage = profile.stages.find(s => s.id === sid)
            if (!stage) {
                globalThis.renderer.utils.showToast('error', '未找到指定步骤')
                return
            }
            const taskIdx = stage.tasks?.findIndex(t => t.id === tid) ?? -1
            if (taskIdx === -1) {
                globalThis.renderer.utils.showToast('error', '未找到指定任务')
                return
            }
            stage.tasks?.splice(taskIdx, 1)
            await mfgApp.saveConfig()
        }
        globalThis.main.task.dup = async (id, sid, tid) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return
            }
            const stage = profile.stages.find(s => s.id === sid)
            if (!stage) {
                globalThis.renderer.utils.showToast('error', '未找到指定步骤')
                return
            }
            const taskIdx = stage.tasks?.findIndex(t => t.id === tid) ?? -1
            if (taskIdx === -1) {
                globalThis.renderer.utils.showToast('error', '未找到指定任务')
                return
            }
            stage.tasks?.splice(taskIdx + 1, 0, cloneTask(stage.tasks[taskIdx]))
            await mfgApp.saveConfig()
        }
        globalThis.main.task.update = async (id, sid, tid, cfg) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return
            }
            const stage = profile.stages.find(s => s.id === sid)
            if (!stage) {
                globalThis.renderer.utils.showToast('error', '未找到指定步骤')
                return
            }
            const task = stage.tasks?.find(t => t.id === tid)
            if (!task) {
                globalThis.renderer.utils.showToast('error', '未找到指定任务')
                return
            }
            Object.assign(task, cfg)
            await mfgApp.saveConfig()
        }
        globalThis.main.task.move = async (id, sid, tid, tidTgt, before) => {
            const profile = mfgApp.config.profiles?.find(p => p.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return
            }
            const stage = profile.stages.find(s => s.id === sid)
            if (!stage) {
                globalThis.renderer.utils.showToast('error', '未找到指定步骤')
                return
            }

            if (!stage.tasks) {
                globalThis.renderer.utils.showToast('error', '未找到指定任务')
                return
            }

            const srcIdx = stage.tasks.findIndex(t => t.id === tid) ?? -1
            if (srcIdx === -1) {
                globalThis.renderer.utils.showToast('error', '未找到指定任务')
                return
            }

            const task = stage.tasks.splice(srcIdx, 1)[0]

            const dstIdx = stage.tasks.findIndex(t => t.id === tidTgt) ?? -1
            if (dstIdx === -1) {
                stage.tasks.splice(srcIdx, 0, task)
                globalThis.renderer.utils.showToast('error', '未找到指定步骤')
                return
            }

            stage.tasks.splice(before ? dstIdx : dstIdx + 1, 0, task)
            await mfgApp.saveConfig()
        }
    }
}
