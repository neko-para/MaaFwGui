<script setup lang="ts">
import type { Status } from '@mfg/types'

defineProps<{
    status?: Status
}>()

const label: Record<Status, string> = {
    running: '进行中',
    succeeded: '已完成',
    failed: '已失败'
}
</script>

<template>
    <span v-if="status"> {{ label[status] }} </span>
</template>
