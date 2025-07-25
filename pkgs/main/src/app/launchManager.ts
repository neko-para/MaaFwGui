import { LaunchId, LaunchInfo, LaunchStatus, ProfileId } from '@mfg/types'

import { generateId } from '../utils/uuid'
import { mfgApp } from './app'

export class MfgLaunchManager {
    launchIndex: Record<ProfileId, LaunchId> = {}
    launchInfo: Record<LaunchId, LaunchInfo> = {}

    async init() {
        main.launch.new = async id => {
            const profile = mfgApp.config.profiles?.find(x => x.id === id)
            if (!profile) {
                return
            }
            if (this.launchIndex[id]) {
                return
            }
            const lid = generateId() as LaunchId
            this.launchIndex[id] = lid
            this.launchInfo[lid] = {
                id: lid,
                status: {
                    profile: id,

                    prevStages: [],
                    prevTasks: []
                },
                instance: {}
            }
            await renderer.launch.updateIndex(this.launchIndex)
            await renderer.launch.updateStatus(lid, this.launchInfo[lid].status)
            this.launch(id)
        }
        main.launch.stop = async id => {
            const launch = this.launchInfo[id]
            if (!launch) {
                return
            }
            // TODO: stop
            launch.status.stopped = true
            await renderer.launch.updateStatus(id, launch.status)
        }
        main.launch.del = async id => {
            const launch = this.launchInfo[id]
            if (!launch) {
                return
            }
            if (!launch.status.stopped) {
                return
            }
            delete this.launchIndex[launch.status.profile]
            delete this.launchInfo[id]

            await renderer.launch.updateIndex(this.launchIndex)
            await renderer.launch.updateStatus(id)
        }
        main.launch.syncIndex = () => {
            return this.launchIndex
        }
        main.launch.syncStatus = () => {
            return Object.fromEntries(
                Object.entries(this.launchInfo).map(
                    ([lid, info]) => [lid, info.status] as [LaunchId, LaunchStatus]
                )
            )
        }
    }

    async launch(pid: ProfileId) {
        const profile = mfgApp.config.profiles?.find(x => x.id === pid)
        if (!profile) {
            console.log('no profile')
            return
        }
        const lid = this.launchIndex[pid]
        if (!lid) {
            console.log('no launch')
            return
        }
        const launch = this.launchInfo[lid]
        for (const stage of profile.stages) {
            launch.status.prevStages.push(stage.id)
            launch.status.currStage = stage.id
            launch.status.prevTasks = []
            launch.status.currTask = undefined
            await renderer.launch.updateStatus(lid, launch.status)

            console.log(stage)
            if (!stage.project) {
                console.log('no project')
                launch.status.stopped = true
                await renderer.launch.updateStatus(lid, launch.status)
                return
            }

            const interfaceData = await mfgApp.projectManager.loadInterface(stage.project)
            if (!interfaceData) {
                console.log('no interface')
                launch.status.stopped = true
                await renderer.launch.updateStatus(lid, launch.status)
                return
            }

            for (const task of stage.tasks ?? []) {
                launch.status.prevTasks.push(task.id)
                launch.status.currTask = task.id
                await renderer.launch.updateStatus(lid, launch.status)

                await new Promise<void>(resolve => setTimeout(resolve, 2000))

                launch.status.currTask = undefined
            }

            launch.status.currStage = undefined
        }

        launch.status.stopped = true
        await renderer.launch.updateStatus(lid, launch.status)
    }
}
