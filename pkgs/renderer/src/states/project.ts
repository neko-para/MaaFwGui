import type { Interface, ProjectId, ProjectInfo } from '@mfg/types'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { syncApps } from './mirrorc'

export const projectInfo = ref<ProjectInfo[]>([])

export async function requestNewExternalProject() {
    await window.main.project.newExternal()
    await syncProjects()
}

export async function requestNewArchiveProject() {
    await window.main.project.newArchive()
    await syncProjects()
}

export async function requestNewGithubProject(url: string) {
    await window.main.project.newGithub(url)
    await syncProjects()
}

export async function requestDelProject(pid: ProjectId) {
    await window.main.project.del(pid)
    await syncProjects()
    await syncApps()
}

export async function syncProjects() {
    projectInfo.value = await window.main.project.query()
}

export async function requestDelGithub(pid: ProjectId) {
    await window.main.project.delGithub(pid)
    await syncProjects()
}

export async function requestBindGithubProject(pid: ProjectId, url: string) {
    await window.main.project.bindGithub(pid, url)
    await syncProjects()
}

export async function requestCheckUpdate(pid: ProjectId, via: 'github' | 'mirrorc') {
    await window.main.project.checkUpdate(pid, via)
    await syncProjects()
}

export function findProject(id?: ProjectId) {
    return projectInfo.value.find(x => x.id === id)
}

export function useProject() {
    const route = useRoute()

    const projectId = computed(() => route.params.project_id as ProjectId | undefined)

    const activeProjectInfo = computed(() => projectInfo.value.find(x => x.id === projectId.value))

    return {
        projectId,
        activeProjectInfo
    }
}

export function useInterface(getId: () => ProjectId | undefined) {
    const interfaceData = ref<Interface | null>(null)

    watch(
        getId,
        id => {
            if (id) {
                window.main.project.loadInterface(id).then(i => {
                    interfaceData.value = i
                })
            }
        },
        {
            immediate: true
        }
    )

    return { interfaceData }
}
