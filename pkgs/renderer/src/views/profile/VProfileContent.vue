<script setup lang="ts">
import { NInput, NScrollbar } from 'naive-ui'
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import MStage from '@/components/MStage.vue'
import { AddOutlined, EditOutlined } from '@/icons'
import {
    profileInfo,
    requestDelStage,
    requestNewStage,
    syncProfile,
    useProfile
} from '@/states/profile'
import { findProject, projectInfo } from '@/states/project'

const { activeProfileInfo, profileId } = useProfile()

const router = useRouter()

async function updateName(name: string) {
    await window.main.profile.update(profileId.value!, {
        name
    })
    await syncProfile()
}
</script>

<template>
    <div v-if="profileId && activeProfileInfo" class="flex flex-col gap-2 m-4">
        <div class="flex flex-col gap-2">
            <span class="text-xl font-bold"> 基础信息 </span>
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
                <span class="text-xl font-bold"> 步骤列表 </span>
                <div class="flex-1"></div>
                <m-icon-button @action="requestNewStage(profileId)">
                    <add-outlined></add-outlined>
                </m-icon-button>
            </div>
            <n-scrollbar>
                <div class="flex flex-col gap-2">
                    <m-stage
                        v-for="stage in activeProfileInfo.stages"
                        :key="stage.id"
                        :id="stage.id"
                    ></m-stage>
                </div>
            </n-scrollbar>
        </div>
    </div>
</template>
