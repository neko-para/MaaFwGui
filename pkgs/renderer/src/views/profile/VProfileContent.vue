<script setup lang="ts">
import { NButton, NInput, NScrollbar } from 'naive-ui'

import MIconButton from '@/components/MIconButton.vue'
import MStage from '@/components/MStage.vue'
import MStageLaunch from '@/components/MStageLaunch.vue'
import { AddOutlined } from '@/icons'
import { useLaunch } from '@/states/launch'
import {
    requestDelLaunch,
    requestDelProfile,
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
                >
                    启动
                </n-button>
                <template v-else-if="launchId">
                    <n-button
                        v-if="!activeLaunchStatus.stopped"
                        @click="requestStopLaunch(launchId)"
                        type="primary"
                    >
                        停止
                    </n-button>
                    <n-button v-else @click="requestDelLaunch(launchId)" type="primary">
                        结束
                    </n-button>
                </template>
            </div>
            <div class="m-4 form-grid items-center gap-2">
                <span> 名称 </span>
                <n-input
                    placeholder="输入新名称"
                    :value="activeProfileInfo.name"
                    @update:value="updateName"
                ></n-input>
                <span></span>
                <div class="flex gap-2">
                    <n-button @click="requestDelProfile(profileId)"> 删除 </n-button>
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-2 min-h-0 grow-0">
            <div class="flex items-center gap-2">
                <span class="text-xl"> 步骤列表 </span>
                <div class="flex-1"></div>
                <m-icon-button
                    @action="requestNewStage(profileId)"
                    :disabled="!!activeLaunchStatus"
                >
                    <add-outlined></add-outlined>
                </m-icon-button>
            </div>
            <n-scrollbar>
                <div class="flex flex-col gap-2">
                    <template v-if="!activeLaunchStatus">
                        <m-stage
                            v-for="stage in activeProfileInfo.stages"
                            :key="stage.id"
                            :id="stage.id"
                        ></m-stage>
                    </template>
                    <template v-else>
                        <div v-for="stage in activeProfileInfo.stages" :key="stage.id">
                            <m-stage-launch
                                :stage="stage"
                                :launch="activeLaunchStatus"
                            ></m-stage-launch>
                        </div>
                    </template>
                </div>
            </n-scrollbar>
        </div>
    </div>
</template>
