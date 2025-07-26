<script setup lang="ts">
import type { LaunchStatus, StageInfo } from '@mfg/types'
import { NCard } from 'naive-ui'

import MStatus from '@/components/MStatus.vue'

defineProps<{
    stage: StageInfo
    launch: LaunchStatus
}>()
</script>

<template>
    <n-card :title="stage.name" size="small">
        <template #header-extra>
            <m-status :status="launch.stages[stage.id]"></m-status>
        </template>

        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <span> 连接设备 </span>
                <div class="flex-1"></div>
                <m-status :status="launch.tasks[stage.id]"></m-status>
            </div>

            <div v-for="task in stage.tasks" :key="task.id" class="flex items-center gap-2">
                <span> {{ task.task }} </span>
                <div class="flex-1"></div>
                <m-status :status="launch.tasks[task.id]"></m-status>
            </div>
        </div>
    </n-card>
</template>
