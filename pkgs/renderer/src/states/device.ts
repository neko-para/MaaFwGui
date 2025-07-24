import type { AdbDevice, AdbDeviceId } from '@mfg/types'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

export const deviceInfo = ref<AdbDevice[]>([])

export async function requestScanDevices() {
    deviceInfo.value = await window.main.device.scan()
}

export async function syncDevices() {
    deviceInfo.value = await window.main.device.query()
}

export function useDevice() {
    const route = useRoute()

    const deviceId = computed(() => route.params.device_id as AdbDeviceId | undefined)

    const activeDeviceInfo = computed(() => deviceInfo.value.find(x => x.id === deviceId.value))

    return {
        deviceId,
        activeDeviceInfo
    }
}
