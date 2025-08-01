import type { MirrorcAppId, MirrorcAppInfo } from '@mfg/types'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

import { syncProjects } from './project'

export const mirrorcAppInfo = ref<MirrorcAppInfo[]>([])

export async function syncApps() {
    mirrorcAppInfo.value = await window.main.mirrorc.queryApp()
}

export async function requestNewApp(url: string) {
    await window.main.mirrorc.newApp(url)
    await syncApps()
}

export async function requestDelApp(id: MirrorcAppId) {
    await window.main.mirrorc.delApp(id)
    await syncApps()
}

export async function requestCheckAppUpdate(id: MirrorcAppId) {
    await window.main.mirrorc.checkAppUpdate(id)
    await syncApps()
}

export async function requestExportApp(id: MirrorcAppId) {
    await window.main.mirrorc.exportApp(id)
    await syncApps()
    await syncProjects()
}

export function useMirrorcApp() {
    const route = useRoute()

    const mirrorcAppId = computed(() => route.params.mirrorc_app_id as MirrorcAppId | undefined)

    const activeMirrorcAppInfo = computed(() =>
        mirrorcAppInfo.value.find(x => x.id === mirrorcAppId.value)
    )

    return {
        mirrorcAppId,
        activeMirrorcAppInfo
    }
}
