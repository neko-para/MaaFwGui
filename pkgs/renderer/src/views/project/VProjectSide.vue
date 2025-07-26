<script setup lang="ts">
import { NButton, NCard, NInput, NModal, NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import MEntry from '@/components/MEntry.vue'
import MIconButton from '@/components/MIconButton.vue'
import MNavBackButton from '@/components/buttons/MNavBackButton.vue'
import { AddOutlined, CloseOutlined } from '@/icons'
import {
    projectInfo,
    requestDelProject,
    requestNewExternalProject,
    requestNewGithubRepoProject,
    useProject
} from '@/states/project'

const router = useRouter()

const { projectId } = useProject()

const showDlg = ref(false)
const waitDlg = ref<(v: boolean) => void>(() => {})
const projectType = ref<'external' | 'githubRepo' | 'githubRelease'>('external')
const projectTypeOptions: SelectMixedOption[] = [
    {
        value: 'external',
        label: '外部项目'
    },
    {
        value: 'githubRepo',
        label: 'Github 仓库'
    },
    {
        value: 'githubRelease',
        label: 'Github 发布 <暂不支持>'
    }
]

const processing = ref(false)

const projectUrl = ref('')
const progress = ref('')
const cleanUp = ref(() => {})

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
        case 'githubRepo':
            if (
                !projectUrl.value ||
                !/^https?:\/\/github.com\/[^/]+\/[^/]+(?:.git|\/)?$/.test(projectUrl.value)
            ) {
                break
            }
            cleanUp.value = window.renderer.project.cloneProgress((phase, loaded, total) => {
                progress.value = `${phase} ${loaded} / ${total}`
            })
            await requestNewGithubRepoProject(projectUrl.value)
            break
        case 'githubRelease':
            return
    }
    showDlg.value = false
}

onUnmounted(() => {
    cleanUp.value()
})
</script>

<template>
    <n-modal :show="showDlg" @update:show="() => waitDlg(false)">
        <n-card title="添加项目" class="max-w-2/3" role="dialog">
            <div class="flex flex-col gap-2">
                <n-select v-model:value="projectType" :options="projectTypeOptions"> </n-select>

                <n-input
                    v-if="projectType === 'githubRepo'"
                    placeholder="https://github.com/your/repo"
                    v-model:value="projectUrl"
                ></n-input>

                <span v-if="progress.length"> {{ progress }} </span>
            </div>

            <template #footer>
                <n-button @click="waitDlg(true)" :loading="processing"> 添加 </n-button>
            </template>
        </n-card>
    </n-modal>

    <div class="m-4 flex flex-col gap-2">
        <div class="flex gap-2">
            <span class="text-xl"> 项目列表 </span>
            <div class="flex-1"></div>
            <m-nav-back-button></m-nav-back-button>
            <m-icon-button :action="newProject" use-loading>
                <add-outlined></add-outlined>
            </m-icon-button>
        </div>
        <div v-for="res in projectInfo" :key="res.id" class="flex items-center gap-2">
            <m-entry
                @click="
                    router.replace({
                        path: `/project/${res.id}`
                    })
                "
            >
                <span class="text-xl">
                    {{ res.name + (res.id === projectId ? ' *' : '') }}
                </span>
            </m-entry>
            <div class="flex-1"></div>
            <m-icon-button :action="async () => requestDelProject(res.id)" use-loading>
                <close-outlined></close-outlined>
            </m-icon-button>
        </div>
    </div>
</template>
