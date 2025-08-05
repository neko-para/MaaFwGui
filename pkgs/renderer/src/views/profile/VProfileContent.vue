<script setup lang="ts">
import type { StageId } from '@mfg/types'
import { NButton, NInput, NScrollbar } from 'naive-ui'
import { ref } from 'vue'

import MButton from '@/components/MButton.vue'
import MDraggable from '@/components/MDraggable.vue'
import MStage from '@/components/MStage.vue'
import MStageLaunch from '@/components/MStageLaunch.vue'
import { useLaunch } from '@/states/launch'
import {
    requestDelLaunch,
    requestNewLaunch,
    requestNewStage,
    requestStopLaunch,
    syncProfile,
    useProfile
} from '@/states/profile'

const { activeProfileInfo, profileId } = useProfile()

const { launchId, activeLaunchStatus } = useLaunch(() => profileId.value)

async function updateName(name: string) {
    await window.main.profile.update(profileId.value!, {
        name
    })
    await syncProfile()
}

async function moveStage(from: string, to: string, before: boolean) {
    await window.main.stage.move(profileId.value!, from as StageId, to as StageId, before)
    await syncProfile()
}
</script>

<template>
    <div v-if="profileId && activeProfileInfo" class="flex flex-col gap-2 m-4 min-h-0 grow-0">
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <span class="text-xl"> 基础信息 </span>
                <div class="flex-1"></div>
                <n-button
                    v-if="!activeLaunchStatus"
                    @click="requestNewLaunch(profileId)"
                    type="primary"
                    size="small"
                >
                    启动
                </n-button>
                <template v-else-if="launchId">
                    <n-button
                        v-if="!activeLaunchStatus.stopped"
                        @click="requestStopLaunch(launchId)"
                        type="primary"
                        size="small"
                    >
                        停止
                    </n-button>
                    <n-button
                        v-else
                        @click="requestDelLaunch(launchId)"
                        type="primary"
                        size="small"
                    >
                        结束
                    </n-button>
                </template>
            </div>

            <div class="form-grid items-center gap-2">
                <span> 名称 </span>
                <n-input
                    placeholder="输入新名称"
                    :value="activeProfileInfo.name"
                    @update:value="updateName"
                    size="small"
                ></n-input>
            </div>
        </div>

        <div class="flex flex-col gap-2 min-h-0 grow-0">
            <div class="flex items-center gap-2">
                <span class="text-xl"> 步骤列表 </span>
                <div class="flex-1"></div>
                <m-button
                    :action="() => requestNewStage(profileId!)"
                    :disabled="!!activeLaunchStatus"
                    use-loading
                >
                    新建步骤
                </m-button>
            </div>
            <m-draggable
                v-if="!activeLaunchStatus"
                :comp="MStage"
                :items="activeProfileInfo.stages"
                key-prop="id"
                half-gap="4px"
                :get-real="el => el.parentElement?.parentElement?.parentElement"
                @dragged="moveStage"
            >
                <template #anchor>
                    <div>排序</div>
                </template>
            </m-draggable>
            <n-scrollbar v-else>
                <div class="flex flex-col">
                    <div v-for="stage in activeProfileInfo.stages" :key="stage.id">
                        <m-stage-launch
                            :launch="launchId!"
                            :stage="stage"
                            :status="activeLaunchStatus"
                        ></m-stage-launch>
                    </div>
                </div>
            </n-scrollbar>
        </div>
    </div>
</template>
