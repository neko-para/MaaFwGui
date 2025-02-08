import type { ResourceInfo } from '@mfg/types/resource'
import { computed, ref } from 'vue'

export const activeResourceInfo = ref<ResourceInfo | null>(null)
export const activeResource = computed(() => {
    return activeResourceInfo.value?.id ?? null
})
