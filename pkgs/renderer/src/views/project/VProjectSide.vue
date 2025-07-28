<script setup lang="ts">
import { NButton, NCard, NInput, NModal, NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import LGenericSide from '@/layouts/LGenericSide.vue'
import {
    projectInfo,
    requestDelProject,
    requestNewExternalProject,
    requestNewGithubReleaseProject,
    useProject
} from '@/states/project'

const router = useRouter()

const { projectId } = useProject()

const showDlg = ref(false)
const waitDlg = ref<(v: boolean) => void>(() => {})
const projectType = ref<'external' | 'githubRelease'>('external')
const projectTypeOptions: SelectMixedOption[] = [
    {
        value: 'external',
        label: '外部项目'
    },
    {
        value: 'githubRelease',
        label: 'Github 发布'
    }
]

const processing = ref(false)

const githubUrl = ref('')
const progress = ref('')

async function newProject() {
    showDlg.value = true
    processing.value = false
    if (
        !(await new Promise<boolean>(resolve => {
            waitDlg.value = resolve
        }))
    ) {
        showDlg.value = false
        return
    }

    processing.value = true

    switch (projectType.value) {
        case 'external':
            await requestNewExternalProject()
            break
        case 'githubRelease':
            if (
                !githubUrl.value ||
                !/^https?:\/\/github.com\/[^/]+\/[^/]+(?:.git|\/)?$/.test(githubUrl.value)
            ) {
                break
            }
            await requestNewGithubReleaseProject(githubUrl.value)
            return
    }
    showDlg.value = false
}
</script>

<template>
    <n-modal :show="showDlg" @update:show="() => waitDlg(false)">
        <n-card title="添加项目" class="max-w-2/3" role="dialog">
            <div class="flex flex-col gap-2">
                <n-select
                    v-model:value="projectType"
                    :options="projectTypeOptions"
                    size="small"
                ></n-select>

                <n-input
                    v-if="projectType === 'githubRelease'"
                    placeholder="https://github.com/your/repo"
                    v-model:value="githubUrl"
                    size="small"
                ></n-input>

                <span v-if="progress.length"> {{ progress }} </span>
            </div>

            <template #footer>
                <n-button @click="waitDlg(true)" :loading="processing"> 添加 </n-button>
            </template>
        </n-card>
    </n-modal>

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
            <m-button :action="newProject" use-loading> 导入 </m-button>
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
