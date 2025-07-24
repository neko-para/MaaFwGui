import type { ProjectId, ProjectInfo } from '@mfg/types'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'

export const projectInfo = ref<ProjectInfo[]>([])

export async function requestNewProject() {
    await window.main.project.new()
    projectInfo.value = await window.main.project.query()
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
