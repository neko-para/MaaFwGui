import { ref } from 'vue'

export const maaVersion = ref<string | null>(null)

export function initMaaHooks() {
    window.renderer.maa.versionChanged(ver => {
        maaVersion.value = ver
    })
}
