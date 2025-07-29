<script setup lang="ts">
import type { SystemInfo } from '@mfg/types'
import { NConfigProvider } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import { theme, themeOverride } from './plugins/theme'
import { syncDevices } from './states/device'
import { syncRepos } from './states/github'
import { syncProfile } from './states/profile'
import { syncProjects } from './states/project'

const systemInfo = ref<SystemInfo>()

const route = useRoute()

onMounted(async () => {
    systemInfo.value = await window.main.utils.querySystemInfo()

    syncProfile()
    syncProjects()
    syncDevices()
    syncRepos()
})
</script>

<template>
    <n-config-provider abstract :theme="theme" :theme-overrides="themeOverride">
        <div class="flex flex-col h-full">
            <div
                class="w-screen h-7 pointer-events-none drag-window shrink-0 flex items-center justify-end pr-2"
            >
                <span class="mr-32"> {{ route.path }} </span>
            </div>
            <div class="flex flex-1 min-h-0">
                <div
                    class="h-full w-80 flex flex-col bg-gradient-to-b from-transparent via-gray-300 to-transparent bg-[length:1px_100%] bg-[position:right_center] bg-no-repeat"
                >
                    <router-view name="side"></router-view>
                </div>
                <div class="h-full flex-1 flex flex-col">
                    <router-view name="content"></router-view>
                </div>
            </div>
        </div>
    </n-config-provider>
</template>
