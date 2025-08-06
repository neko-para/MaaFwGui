<script setup lang="ts">
import type { LaunchId, LaunchStatus, StageInfo } from '@mfg/types'
import { NCard } from 'naive-ui'

import MStatus from '@/components/MStatus.vue'
import { useLaunch } from '@/states/launch'

import MButton from './MButton.vue'

const props = defineProps<{
    launch: LaunchId
    stage: StageInfo
    status: LaunchStatus
}>()

const { activeLaunchCache } = useLaunch(() => props.status.profile)

function switchOutput(type: 'agent' | 'focus') {
    if (!activeLaunchCache.value) {
        return
    }
    activeLaunchCache.value.activeChanged = true
    activeLaunchCache.value.activeOutput = {
        type,
        stage: props.stage.id
    }
}
</script>

<template>
    <n-card :title="stage.name" size="small">
        <template #header-extra>
            <div class="flex items-center gap-2">
                <m-button v-if="status.hasAgent" @action="switchOutput('agent')">
                    agent日志
                </m-button>
                <m-button @action="switchOutput('focus')"> 执行日志 </m-button>
                <m-status :status="status.stages[stage.id]"></m-status>
            </div>
        </template>

        <div class="flex gap-2">
            <div class="flex flex-col gap-2 flex-1">
                <div
                    v-for="(prepare, idx) of status.prepares"
                    :key="idx"
                    class="flex items-center gap-2"
                >
                    <span> {{ prepare.stage }} </span>
                    <div class="flex-1"></div>
                    <m-status :status="prepare.status"></m-status>
                </div>

                <div v-for="task in stage.tasks" :key="task.id" class="flex items-center gap-2">
                    <span> {{ task.task }} </span>
                    <div class="flex-1"></div>
                    <m-status :status="status.tasks[task.id]"></m-status>
                </div>
            </div>
        </div>
    </n-card>
</template>
