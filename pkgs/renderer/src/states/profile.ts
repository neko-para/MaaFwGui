import type { ProfileId, ProfileInfo, StageId } from '@mfg/types'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

export const profileInfo = ref<ProfileInfo[]>([])

export async function requestNewProfile() {
    await window.main.profile.new()
    profileInfo.value = await window.main.profile.query()
}

export async function syncProfile() {
    profileInfo.value = await window.main.profile.query()
}

export async function requestNewStage(profile: ProfileId) {
    await window.main.stage.new(profile)
    await syncProfile()
}

export async function requestDelStage(pid: ProfileId, sid: StageId) {
    await window.main.stage.del(pid, sid)
    await syncProfile()
}

export function useProfile() {
    const route = useRoute()

    const profileId = computed(() => route.params.profile_id as ProfileId | undefined)

    const activeProfileInfo = computed(() => profileInfo.value.find(x => x.id === profileId.value))

    return {
        profileId,
        activeProfileInfo
    }
}
