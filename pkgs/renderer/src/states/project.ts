import type { Interface, ProjectId, ProjectInfo } from '@mfg/types'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export const projectInfo = ref<ProjectInfo[]>([])

export async function requestNewExternalProject() {
    await window.main.project.new('external')
    await syncProjects()
}

export async function requestNewGithubRepoProject(url: string) {
    await window.main.project.new('managed', {
        type: 'githubRepo',
        url
    })
    await syncProjects()
}

export async function requestDelProject(pid: ProjectId) {
    await window.main.project.del(pid)
    await syncProjects()
}

export async function syncProjects() {
    projectInfo.value = await window.main.project.query()
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
