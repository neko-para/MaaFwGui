<script setup lang="ts">
import { NPopselect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import MAddGithub from '@/components/MAddGithub.vue'
import MAddMirrorc from '@/components/MAddMirrorc.vue'
import MButton from '@/components/MButton.vue'
import LGenericSide from '@/layouts/LGenericSide.vue'
import {
    projectInfo,
    requestDelProject,
    requestNewArchiveProject,
    requestNewExternalProject,
    requestNewGithubProject,
    syncProjects,
    useProject
} from '@/states/project'

const router = useRouter()

const { projectId } = useProject()

const addGithubEl = ref<InstanceType<typeof MAddGithub> | null>(null)
const addMirrorcEl = ref<InstanceType<typeof MAddMirrorc> | null>(null)

const loading = ref(false)

const importOptions = [
    { value: 'archive', label: '本地资源' },
    { value: 'github', label: 'Github' },
    { value: 'mirrorc', label: 'MirrorChyan' }
] satisfies SelectMixedOption[]

async function requestImport(type: 'archive' | 'github' | 'mirrorc') {
    loading.value = true
    switch (type) {
        case 'archive':
            await requestNewArchiveProject()
            break
        case 'github':
            await addGithubEl.value?.addGithub()
            break
        case 'mirrorc':
            await addMirrorcEl.value?.addMirrorc()
            break
    }
    loading.value = false
}

function checkMime(mime: string) {
    return [
        'application/zip',
        'application/x-zip',
        'application/zip-compressed',
        'application/x-zip-compressed',
        'application/x-gzip',
        'application/x-gtar'
    ].includes(mime)
}

function checkFile(file: File) {
    return file.name.endsWith('.zip') || file.name.endsWith('.tar.gz') || file.name.endsWith('.tar')
}

function dragOver(e: DragEvent) {
    for (const item of e.dataTransfer?.items ?? []) {
        if (item.kind === 'file' && checkMime(item.type)) {
            e.preventDefault()
            return
        }
    }
}

async function drop(e: DragEvent) {
    const files: File[] = []
    for (const file of e.dataTransfer?.files ?? []) {
        if (checkFile(file)) {
            files.push(file)
        }
    }
    if (files.length > 0) {
        e.preventDefault()
        loading.value = true
        await window.main.project.newArchive(files.map(file => window.ipc.resolveFile(file)))
        await syncProjects()
        loading.value = false
    }
}
</script>

<template>
    <m-add-github ref="addGithubEl"></m-add-github>
    <m-add-mirrorc ref="addMirrorcEl"></m-add-mirrorc>

    <l-generic-side
        title="项目列表"
        :items="projectInfo"
        key-prop="id"
        @click="
            project => {
                router.replace({
                    path: `/project/${project.id}`
                })
            }
        "
    >
        <template #actions>
            <m-button :action="requestNewExternalProject" use-loading> 关联 </m-button>
            <n-popselect trigger="hover" :options="importOptions" @update:value="requestImport">
                <m-button :loading="loading"> 导入 </m-button>
            </n-popselect>
        </template>

        <template #itemEntry="{ item: project }">
            <span class="text-xl">
                {{
                    (project.name === '' ? '<未命名项目>' : project.name) +
                    (project.id === projectId ? ' *' : '')
                }}
            </span>
        </template>

        <template #itemActions="{ item: project }">
            <m-button :action="async () => requestDelProject(project.id)" use-loading>
                删除
            </m-button>
        </template>

        <template #bottom>
            <div
                class="flex-1 min-h-8 max-h-80 mt-auto border-dashed border-gray-500 border flex flex-col items-center justify-center"
                @dragover="dragOver"
                @drop="drop"
            >
                <span class="text-md"> 拖拽压缩包以添加项目 </span>
            </div>
        </template>
    </l-generic-side>
</template>
