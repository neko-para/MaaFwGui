import type { GlobalConfig } from '@mfg/types'
import { ref } from 'vue'

export const config = ref<GlobalConfig>({})

export async function syncConfig() {
    config.value = await window.main.utils.queryConfig()
}
