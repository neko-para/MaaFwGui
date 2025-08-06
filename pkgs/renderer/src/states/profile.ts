import type { LaunchId, ProfileId, ProfileInfo, StageId, TaskId } from '@mfg/types'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

export const profileInfo = ref<ProfileInfo[]>([])

export async function requestNewProfile() {
    await window.main.profile.new()
    await syncProfile()
}

export async function requestDelProfile(pid: ProfileId) {
    await window.main.profile.del(pid)
    await syncProfile()
}

export async function requestDupProfile(pid: ProfileId) {
    await window.main.profile.dup(pid)
    await syncProfile()
}

export async function syncProfile() {
    profileInfo.value = await window.main.profile.query()
}

export async function requestNewStage(pid: ProfileId) {
    await window.main.stage.new(pid)
    await syncProfile()
}

export async function requestDelStage(pid: ProfileId, sid: StageId) {
    await window.main.stage.del(pid, sid)
    await syncProfile()
}

export async function requestDupStage(pid: ProfileId, sid: StageId) {
    await window.main.stage.dup(pid, sid)
    await syncProfile()
}

export async function requestNewTask(pid: ProfileId, sid: StageId) {
    await window.main.task.new(pid, sid)
    await syncProfile()
}

export async function requestDelTask(pid: ProfileId, sid: StageId, tid: TaskId) {
    await window.main.task.del(pid, sid, tid)
    await syncProfile()
}

export async function requestDupTask(pid: ProfileId, sid: StageId, tid: TaskId) {
    await window.main.task.dup(pid, sid, tid)
    await syncProfile()
}

export async function requestNewLaunch(pid: ProfileId) {
    await window.main.launch.new(pid)
}

export async function requestStopLaunch(lid: LaunchId) {
    await window.main.launch.stop(lid)
}

export async function requestDelLaunch(lid: LaunchId) {
    await window.main.launch.del(lid)
}

export function useProfile() {
    const route = useRoute()

    const profileId = computed(() => route.params.profile_id as ProfileId | undefined)

    const activeProfileInfo = computed(() => profileInfo.value.find(x => x.id === profileId.value))

    const stageId = computed(() => route.params.stage_id as StageId | undefined)

    const activeStageInfo = computed(() =>
        activeProfileInfo.value?.stages.find(x => x.id === stageId.value)
    )

    return {
        profileId,
        activeProfileInfo,
        stageId,
        activeStageInfo
    }
}

export function stageName(profile: ProfileInfo, sid: StageId) {
    const stage = profile.stages.find(x => x.id === sid)
    return stage?.name ?? '<未命名步骤>'
}
