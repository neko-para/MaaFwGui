<script setup lang="ts">
import type { Status } from '@mfg/types'
import { NIcon, NSpin } from 'naive-ui'

import { DoneOutlined, ErrorOutlineOutlined, PendingOutlined, SyncOutlined } from '@/icons'

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
    <!-- <n-icon v-if="status !== 'running'" size="28">
        <done-outlined v-if="status === 'succeeded'"></done-outlined>
        <error-outline-outlined v-else-if="status === 'failed'"></error-outline-outlined>
        <pending-outlined v-else></pending-outlined>
    </n-icon>
    <n-icon v-else size="28" color="black" style="animation: reverse spin 2s linear infinite">
        <sync-outlined></sync-outlined>
    </n-icon> -->
    <span v-if="status"> {{ label[status] }} </span>
</template>
