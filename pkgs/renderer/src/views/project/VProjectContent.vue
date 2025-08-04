<script setup lang="ts">
import { ref } from 'vue'

import MAddGithub from '@/components/MAddGithub.vue'
import MButton from '@/components/MButton.vue'
import MPath from '@/components/MPath.vue'
import { requestCheckUpdate, requestDelGithub, useInterface, useProject } from '@/states/project'

const addGithubEl = ref<InstanceType<typeof MAddGithub> | null>(null)

const { activeProjectInfo, projectId } = useProject()

const { interfaceData } = useInterface(() => projectId.value)
</script>

<template>
    <m-add-github :project="projectId" ref="addGithubEl"></m-add-github>

    <div class="m-4 flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <span class="text-xl"> 基础信息 </span>
        </div>
        <div v-if="activeProjectInfo && interfaceData" class="form-grid items-center gap-2">
            <span> 名称 </span>
            <span> {{ activeProjectInfo.name }} </span>
            <span> 版本 </span>
            <span> {{ activeProjectInfo.version ?? '无版本信息' }} </span>
            <span> 更新通道 </span>
            <span> {{ activeProjectInfo.channel ?? 'stable' }} </span>
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
                        <m-button :action="async () => requestDelGithub(projectId!)" use-loading>
                            移除
                        </m-button>
                    </template>
                    <template v-else>
                        <m-button :action="addGithubEl?.addGithub" use-loading> 添加 </m-button>
                    </template>
                </div>

                <span> MirrorChyan </span>
                <template v-if="activeProjectInfo.mirrorc">
                    <div class="flex items-center gap-2">
                        <span>
                            {{ activeProjectInfo.mirrorc.rid }}
                        </span>
                        <m-button use-loading> 检查更新 </m-button>
                    </div>
                </template>
                <template v-else> 添加... </template>
            </template>
        </div>
    </div>
</template>
