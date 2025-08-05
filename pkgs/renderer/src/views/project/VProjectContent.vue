<script setup lang="ts">
import type { ProjectUpdateChannel } from '@mfg/types'
import { NInput, NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { ref } from 'vue'

import MAddGithub from '@/components/MAddGithub.vue'
import MAddMirrorc from '@/components/MAddMirrorc.vue'
import MButton from '@/components/MButton.vue'
import MPath from '@/components/MPath.vue'
import {
    requestCheckUpdate,
    requestDelGithubProject,
    requestDelMirrorcProject,
    syncProjects,
    useInterface,
    useProject
} from '@/states/project'

const addGithubEl = ref<InstanceType<typeof MAddGithub> | null>(null)
const addMirrorcEl = ref<InstanceType<typeof MAddMirrorc> | null>(null)

const { activeProjectInfo, projectId } = useProject()

const { interfaceData } = useInterface(() => projectId.value)

const channelOptions = [
    { value: 'stable', label: 'stable' },
    { value: 'beta', label: 'beta' },
    { value: 'alpha', label: 'alpha' }
] satisfies SelectMixedOption[]

async function updateName(name: string) {
    await window.main.project.update(projectId.value!, {
        name
    })
    await syncProjects()
}

async function updateChannel(channel: ProjectUpdateChannel) {
    await window.main.project.update(projectId.value!, {
        channel
    })
    await syncProjects()
}
</script>

<template>
    <m-add-github :project="projectId" ref="addGithubEl"></m-add-github>
    <m-add-mirrorc ref="addMirrorcEl"></m-add-mirrorc>

    <div class="m-4 flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <span class="text-xl"> 基础信息 </span>
        </div>
        <div v-if="activeProjectInfo && interfaceData" class="form-grid items-center gap-2">
            <span> 名称 </span>
            <n-input
                placeholder="输入新名称"
                :value="activeProjectInfo.name"
                @update:value="updateName"
                size="small"
            ></n-input>
            <span> 版本 </span>
            <span> {{ activeProjectInfo.version ?? '无版本信息' }} </span>
            <span> 更新通道 </span>
            <n-select
                placeholder="stable"
                :options="channelOptions"
                :value="activeProjectInfo.channel"
                @update:value="updateChannel"
                size="small"
            ></n-select>
            <span> 路径 </span>
            <m-path :path="activeProjectInfo.path"></m-path>
            <span> 类型 </span>
            <span> {{ activeProjectInfo.type === 'external' ? '外部' : '托管' }} </span>
            <template v-if="activeProjectInfo.type === 'managed'">
                <span> Github </span>
                <div class="flex items-center gap-2">
                    <template v-if="activeProjectInfo.github">
                        <span>
                            {{
                                `${activeProjectInfo.github.owner}/${activeProjectInfo.github.repo}`
                            }}
                        </span>
                        <m-button
                            :action="async () => requestCheckUpdate(projectId!, 'github')"
                            use-loading
                        >
                            检查更新
                        </m-button>
                        <m-button
                            :action="async () => requestDelGithubProject(projectId!)"
                            use-loading
                        >
                            移除
                        </m-button>
                    </template>
                    <template v-else>
                        <m-button :action="addGithubEl?.addGithub" use-loading> 添加 </m-button>
                    </template>
                </div>

                <span> MirrorChyan </span>
                <div class="flex items-center gap-2">
                    <template v-if="activeProjectInfo.mirrorc">
                        <span>
                            {{ activeProjectInfo.mirrorc.rid }}
                        </span>
                        <m-button
                            :action="async () => requestCheckUpdate(projectId!, 'mirrorc')"
                            use-loading
                        >
                            检查更新
                        </m-button>
                        <m-button
                            :action="async () => requestDelMirrorcProject(projectId!)"
                            use-loading
                        >
                            移除
                        </m-button>
                    </template>
                    <template v-else>
                        <m-button :action="addMirrorcEl?.addMirrorc" use-loading> 添加 </m-button>
                    </template>
                </div>
            </template>
        </div>
    </div>
</template>
