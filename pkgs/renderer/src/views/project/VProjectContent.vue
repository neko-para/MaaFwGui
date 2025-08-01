<script setup lang="ts">
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import MPath from '@/components/MPath.vue'
import { useInterface, useProject } from '@/states/project'

const router = useRouter()

const { activeProjectInfo, projectId } = useProject()

const { interfaceData } = useInterface(() => projectId.value)
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <span class="text-xl"> 基础信息 </span>
        </div>
        <div v-if="activeProjectInfo && interfaceData" class="form-grid items-center gap-2">
            <span> 名称 </span>
            <span> {{ activeProjectInfo.name }} </span>
            <span> 路径 </span>
            <m-path :path="activeProjectInfo.path"></m-path>
            <span> 类型 </span>
            <span> {{ activeProjectInfo.type === 'external' ? '外部' : '托管' }} </span>
            <template v-if="activeProjectInfo.type === 'managed'">
                <template v-if="activeProjectInfo.github">
                    <span> 来源 </span>
                    <div class="flex items-center gap-2">
                        <span> Github </span>
                        <m-button
                            @action="
                                () => {
                                    router.push({
                                        path: `/github-repo/${activeProjectInfo!.github}`
                                    })
                                }
                            "
                        >
                            查看
                        </m-button>
                    </div>
                </template>
                <template v-if="activeProjectInfo.mirrorc">
                    <span> 来源 </span>
                    <div class="flex items-center gap-2">
                        <span> MirrorChyan </span>
                        <m-button
                            @action="
                                () => {
                                    router.push({
                                        path: `/mirrorc-app/${activeProjectInfo!.mirrorc}`
                                    })
                                }
                            "
                        >
                            查看
                        </m-button>
                    </div>
                </template>
            </template>
        </div>
    </div>
</template>
