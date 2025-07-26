import type { LaunchId, LaunchStatus, ProfileId } from '@mfg/types'
import { computed, ref } from 'vue'

export const launchIndex = ref<Record<ProfileId, LaunchId>>({})
export const launchStatus = ref<Record<LaunchId, LaunchStatus>>({})

export async function syncLaunch() {
    launchIndex.value = await window.main.launch.syncIndex()
    launchStatus.value = await window.main.launch.syncStatus()
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
}
