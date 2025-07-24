<script setup lang="ts">
import type { SystemInfo } from '@mfg/types'
import { onMounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import { syncDevices } from './states/device'
import { syncProfile } from './states/profile'
import { syncProjects } from './states/project'

const systemInfo = ref<SystemInfo>()

const route = useRoute()

onMounted(async () => {
    systemInfo.value = await window.main.utils.querySystemInfo()

    syncProfile()
    syncProjects()
    syncDevices()
})
</script>

<template>
    <div class="flex flex-col h-full">
        <div
            class="w-screen h-7 pointer-events-none drag-window shrink-0 flex items-center justify-end pr-2"
        >
            {{ route.path }}
        </div>
        <div class="flex min-h-0">
            <div class="h-full w-75 flex flex-col">
                <router-view name="side"></router-view>
            </div>
            <div class="h-full flex-1 flex flex-col">
                <router-view name="content"></router-view>
            </div>
        </div>
    </div>
</template>
