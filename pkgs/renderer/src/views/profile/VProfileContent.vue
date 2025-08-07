<script setup lang="ts">
import type { ProfileInfo, StageId } from '@mfg/types'
import { NButton, NInput, NScrollbar } from 'naive-ui'
import { onMounted, ref } from 'vue'

import MButton from '@/components/MButton.vue'
import MDraggable from '@/components/MDraggable.vue'
import MLogPanel from '@/components/MLogPanel.vue'
import MStage from '@/components/MStage.vue'
import MStageLaunch from '@/components/MStageLaunch.vue'
import { useLaunch } from '@/states/launch'
import {
    requestDelLaunch,
    requestNewLaunch,
    requestNewStage,
    requestStopLaunch,
    stageName,
    syncProfile,
    useProfile
} from '@/states/profile'
import type { ComponentExposed } from '@/types'

import { ProfileRevealStage } from '.'

const { activeProfileInfo, profileId } = useProfile()

const { launchId, activeLaunchStatus, activeLaunchCache } = useLaunch(() => profileId.value)

async function updateName(name: string) {
    await window.main.profile.update(profileId.value!, {
        name
    })
    await syncProfile()
}

async function newStage() {
    const id = await requestNewStage(profileId.value!)
    if (id) {
        setTimeout(() => {
            draggableEl.value?.revealItem(id)
        }, 1)
    }
}

async function moveStage(from: string, to: string, before: boolean) {
    await window.main.stage.move(profileId.value!, from as StageId, to as StageId, before)
    await syncProfile()
}

const draggableEl = ref<ComponentExposed<typeof MDraggable<ProfileInfo>> | null>(null)

onMounted(() => {
    ProfileRevealStage.value = stage => {
        draggableEl.value?.revealItem(stage)
    }
})
</script>

<template>
    <div v-if="profileId && activeProfileInfo" class="flex flex-col gap-2 m-4 min-h-0 flex-1">
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

        <div class="flex flex-col gap-2 min-h-0 flex-1">
            <div class="flex items-center gap-2">
                <span class="text-xl"> 步骤列表 </span>
                <div class="flex-1"></div>
                <m-button :action="newStage" :disabled="!!activeLaunchStatus" use-loading>
                    新建步骤
                </m-button>
            </div>
            <m-draggable
                v-if="!activeLaunchStatus"
                ref="draggableEl"
                :comp="MStage"
                :items="activeProfileInfo.stages"
                key-prop="id"
                half-gap="4px"
                :get-real="el => el.parentElement?.parentElement?.parentElement?.parentElement"
                @dragged="moveStage"
            >
                <template #anchor>
                    <m-button class="pointer-events-none">排序</m-button>
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

        <template v-if="activeLaunchCache?.activeOutput">
            <m-log-panel
                :stage-name="stageName(activeProfileInfo, activeLaunchCache.activeOutput.stage)"
                :cache="activeLaunchCache"
            ></m-log-panel>
        </template>
    </div>
</template>
