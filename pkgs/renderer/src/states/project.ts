import type { ProjectInfo } from '@mfg/types'
import { ref } from 'vue'

export const projectInfo = ref<ProjectInfo[]>([])

export async function requestNewProject() {
    await window.main.project.new()
    projectInfo.value = await window.main.project.query()
}

export async function initProjects() {
    projectInfo.value = await window.main.project.query()
}
