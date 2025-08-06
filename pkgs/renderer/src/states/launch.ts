import type { LaunchActiveOutput, LaunchId, LaunchStatus, ProfileId, StageId } from '@mfg/types'
import { computed, ref } from 'vue'

export type LaunchCache = {
    activeOutput?: LaunchActiveOutput
    activeChanged?: boolean
    agentOutput?: Record<StageId, string[]>
    focusOutput?: Record<StageId, string[]>
}

export const launchIndex = ref<Record<ProfileId, LaunchId>>({})
export const launchStatus = ref<Record<LaunchId, LaunchStatus>>({})

export const launchCaches = ref<Record<LaunchId, LaunchCache>>({})

export async function syncLaunch() {
    launchIndex.value = await window.main.launch.syncIndex()
    launchStatus.value = await window.main.launch.syncStatus()

    for (const lid of Object.keys(launchCaches.value) as LaunchId[]) {
        if (!(lid in launchStatus.value)) {
            delete launchCaches.value[lid]
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

    const activeLaunchCache = computed(() => {
        return launchId.value ? launchCaches.value[launchId.value] : undefined
    })

    return {
        launchId,
        activeLaunchStatus,
        activeLaunchCache
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

    window.renderer.launch.addOutput(async (lid, sid, type, output) => {
        launchCaches.value[lid] = launchCaches.value[lid] ?? {}

        let outputRecord: Record<StageId, string[]> = {}
        switch (type) {
            case 'agent':
                launchCaches.value[lid].agentOutput = launchCaches.value[lid].agentOutput ?? {}
                outputRecord = launchCaches.value[lid].agentOutput
                break
            case 'focus':
                launchCaches.value[lid].focusOutput = launchCaches.value[lid].focusOutput ?? {}
                outputRecord = launchCaches.value[lid].focusOutput
                break
        }
        outputRecord[sid] = outputRecord[sid] ?? []
        outputRecord[sid].push(...output.replaceAll(/\x1b\[\d+m/g, '').split('\n'))
    })

    window.renderer.launch.setActiveOutput(async (lid, output) => {
        launchCaches.value[lid] = launchCaches.value[lid] ?? {}
        if (!launchCaches.value[lid].activeChanged) {
            launchCaches.value[lid].activeOutput = output
        }
    })
}
