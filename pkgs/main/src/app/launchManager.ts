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
                    profile: id
                },
                instance: {}
            }
            await renderer.launch.updateIndex(this.launchIndex)
            await renderer.launch.updateStatus(lid, this.launchInfo[lid].status)
            // TODO: start
        }
        main.launch.stop = async id => {
            const launch = this.launchInfo[id]
            if (!launch) {
                return
            }
            // TODO: stop
            launch.status.stopped = true
            await renderer.launch.updateStatus(id, this.launchInfo[id].status)
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
}
