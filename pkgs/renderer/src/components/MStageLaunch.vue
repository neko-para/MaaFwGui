<script setup lang="ts">
import type { LaunchStatus, StageInfo } from '@mfg/types'
import { NCard } from 'naive-ui'

defineProps<{
    stage: StageInfo
    launch: LaunchStatus
}>()
</script>

<template>
    <n-card :title="stage.name" size="small">
        <template #header-extra>
            {{ launch.stages[stage.id] ?? 'pending' }}
        </template>

        <div class="flex flex-col gap-2">
            <div v-for="task in stage.tasks" :key="task.id">
                {{ task.task }} - {{ launch.tasks[task.id] ?? 'pending' }}
            </div>
        </div>
    </n-card>
</template>
