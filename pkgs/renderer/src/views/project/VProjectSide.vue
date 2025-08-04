<script setup lang="ts">
import { NButton, NCard, NInput, NModal, NPopselect, NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import MAddGithub from '@/components/MAddGithub.vue'
import MButton from '@/components/MButton.vue'
import LGenericSide from '@/layouts/LGenericSide.vue'
import {
    projectInfo,
    requestDelProject,
    requestNewArchiveProject,
    requestNewExternalProject,
    requestNewGithubProject,
    useProject
} from '@/states/project'

const router = useRouter()

const { projectId } = useProject()

const addGithubEl = ref<InstanceType<typeof MAddGithub> | null>(null)

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
            router.push({
                path: '/mirrorc-app'
            })
            break
    }
    loading.value = false
}
</script>

<template>
    <m-add-github ref="addGithubEl"></m-add-github>

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
                {{ project.name + (project.id === projectId ? ' *' : '') }}
            </span>
        </template>

        <template #itemActions="{ item: project }">
            <m-button :action="async () => requestDelProject(project.id)" use-loading>
                删除
            </m-button>
        </template>
    </l-generic-side>
</template>
