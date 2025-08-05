import type { LaunchId, LaunchStatus, ProfileId, StageId } from '@mfg/types'
import { computed, ref } from 'vue'

export const launchIndex = ref<Record<ProfileId, LaunchId>>({})
export const launchStatus = ref<Record<LaunchId, LaunchStatus>>({})
export const agentOutput = ref<Record<LaunchId, Record<StageId, string[]>>>({})

export async function syncLaunch() {
    launchIndex.value = await window.main.launch.syncIndex()
    launchStatus.value = await window.main.launch.syncStatus()

    for (const lid of Object.keys(agentOutput.value) as LaunchId[]) {
        if (!(lid in launchStatus.value)) {
            delete agentOutput.value[lid]
        }
    }
}

export function useLaunch(get: () => ProfileId | undefined) {
    const launchId = computed(() => {
        const pid = get()
        return pid ? launchIndex.value[pid] : undefined
    })

    const activeLaunchStatus = computed(() => {
        return launchId.value ? launchStatus.value[launchId.value] : undefined
    })

    return {
        launchId,
        activeLaunchStatus
    }
}

export function initLaunchHooks() {
    window.renderer.launch.updateIndex(async index => {
        launchIndex.value = index
    })

    window.renderer.launch.updateStatus(async (lid, status) => {
        if (status) {
            launchStatus.value[lid] = status
        } else {
            delete launchStatus.value[lid]
        }
    })

    window.renderer.launch.addAgentOutput(async (lid, sid, output) => {
        agentOutput.value[lid] = agentOutput.value[lid] ?? {}
        agentOutput.value[lid][sid] = (agentOutput.value[lid][sid] ?? []).concat(
            output.replaceAll(/\x1b\[\d+m/g, '')
        )
    })
}
