<script setup lang="ts">
import type { StageInfo } from '@mfg/types'
import { NCard } from 'naive-ui'

defineProps<{
    status: 'pending' | 'running' | 'finish'
    stage: StageInfo
}>()
</script>

<template>
    <n-card :title="stage.name" size="small">
        <template #header-extra>
            {{ status }}
        </template>
    </n-card>
</template>
