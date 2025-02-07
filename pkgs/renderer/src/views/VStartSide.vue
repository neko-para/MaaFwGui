<script setup lang="ts">
import type { AdbDevice } from '@mfg/types'
import { LinkOutlined, RefreshOutlined } from '@vicons/material'
import { NButton, NIcon } from 'naive-ui'
import { ref } from 'vue'

const refreshing = ref(false)
const devices = ref<AdbDevice[]>([])

async function requestRefresh() {
    refreshing.value = true
    devices.value = (await window.main.maa.scanDevice()) ?? []
    refreshing.value = false
}
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex gap-2 justify-between">
            <span class="text-xl font-bold"> 已连接的设备 </span>
        </div>
        <div class="flex gap-2 justify-between">
            <span class="text-xl font-bold"> 其它设备 </span>
            <n-button text @click="requestRefresh" :loading="refreshing" :focusable="false">
                <template #icon>
                    <n-icon size="24">
                        <refresh-outlined />
                    </n-icon>
                </template>
            </n-button>
        </div>
        <div v-for="(dev, idx) of devices" :key="idx" class="flex gap-2">
            <span> {{ dev.name }} - {{ dev.address }} </span>
            <n-button text :focusable="false">
                <n-icon size="24">
                    <link-outlined />
                </n-icon>
            </n-button>
        </div>
    </div>
</template>
