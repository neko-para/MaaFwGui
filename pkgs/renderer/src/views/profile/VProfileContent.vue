<script setup lang="ts">
import { NInput, NScrollbar } from 'naive-ui'

import MIconButton from '@/components/MIconButton.vue'
import MStage from '@/components/MStage.vue'
import MStageLaunch from '@/components/MStageLaunch.vue'
import { AddOutlined, CloseOutlined, PauseOutlined, PlayArrowOutlined, StopOutlined } from '@/icons'
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
                <m-icon-button v-if="!activeLaunchStatus" @action="requestNewLaunch(profileId)">
                    <play-arrow-outlined></play-arrow-outlined>
                </m-icon-button>
                <template v-else-if="launchId">
                    <m-icon-button
                        v-if="!activeLaunchStatus.stopped"
                        @action="requestStopLaunch(launchId)"
                    >
                        <pause-outlined></pause-outlined>
                    </m-icon-button>
                    <m-icon-button v-else @action="requestDelLaunch(launchId)">
                        <stop-outlined></stop-outlined>
                    </m-icon-button>
                </template>
                <m-icon-button @action="requestDelProfile(profileId)">
                    <close-outlined></close-outlined>
                </m-icon-button>
            </div>
            <div class="m-4 form-grid items-center gap-2">
                <span> 名称 </span>
                <n-input
                    placeholder="输入新名称"
                    :value="activeProfileInfo.name"
                    @update:value="updateName"
                ></n-input>
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
                            <template v-if="activeLaunchStatus.prevStages?.includes(stage.id)">
                                <m-stage-launch status="finish" :stage="stage"></m-stage-launch>
                            </template>
                            <template v-else-if="activeLaunchStatus.currStage === stage.id">
                                <m-stage-launch status="running" :stage="stage"></m-stage-launch>
                            </template>
                            <template v-else>
                                <m-stage-launch status="pending" :stage="stage"></m-stage-launch>
                            </template>
                        </div>
                    </template>
                </div>
            </n-scrollbar>
        </div>
    </div>
</template>
