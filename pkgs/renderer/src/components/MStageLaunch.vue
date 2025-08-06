<script setup lang="ts">
import type { LaunchId, LaunchStatus, StageInfo } from '@mfg/types'
import { NCard, NScrollbar } from 'naive-ui'

import MStatus from '@/components/MStatus.vue'
import { agentOutput } from '@/states/launch'

defineProps<{
    launch: LaunchId
    stage: StageInfo
    status: LaunchStatus
}>()
</script>

<template>
    <div class="flex gap-2">
        <n-card :title="stage.name" class="flex-1" size="small">
            <template #header-extra>
                <m-status :status="status.stages[stage.id]"></m-status>
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
        <n-scrollbar class="max-w-1/2 max-h-32 p-2 flex flex-col">
            <div class="flex flex-col gap-0.5">
                <span v-for="(output, idx) of agentOutput[launch]?.[stage.id] ?? []" :key="idx">
                    {{ output }}
                </span>
            </div>
        </n-scrollbar>
    </div>
</template>
