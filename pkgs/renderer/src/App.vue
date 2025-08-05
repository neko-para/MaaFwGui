<script setup lang="ts">
import type { SystemInfo } from '@mfg/types'
import { NConfigProvider, NMessageProvider, NNotificationProvider } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'

import MProgressTracker from '@/components/MProgressTracker.vue'
import MToastTracker from '@/components/MToastTracker.vue'
import MUpdateFoundTracker from '@/components/MUpdateFoundTracker.vue'

import { theme, themeOverride } from './plugins/theme'
import { config, syncConfig } from './states/config'
import { syncDevices } from './states/device'
import { syncProfile } from './states/profile'
import { syncProjects } from './states/project'

const systemInfo = ref<SystemInfo>()

const route = useRoute()

onMounted(async () => {
    systemInfo.value = await window.main.utils.querySystemInfo()

    syncConfig()
    syncProfile()
    syncProjects()
    syncDevices()
})
</script>

<template>
    <n-config-provider abstract :theme="theme" :theme-overrides="themeOverride">
        <n-message-provider>
            <n-notification-provider>
                <m-toast-tracker></m-toast-tracker>
                <m-update-found-tracker></m-update-found-tracker>
                <m-progress-tracker></m-progress-tracker>

                <div class="flex flex-col h-full relative">
                    <div
                        class="w-screen h-7 pointer-events-none drag-window shrink-0 flex items-center justify-end pr-2"
                    >
                        <span class="mr-32" v-if="config.debugMode"> {{ route.path }} </span>
                    </div>
                    <div class="flex min-h-0 flex-1">
                        <div class="h-full w-80 flex flex-col">
                            <router-view name="side"></router-view>
                        </div>
                        <div class="h-full flex-1 flex flex-col">
                            <router-view name="content" v-slot="{ Component }">
                                <keep-alive>
                                    <component :is="Component" :key="route.fullPath" />
                                </keep-alive>
                            </router-view>
                        </div>
                    </div>
                </div>
            </n-notification-provider>
        </n-message-provider>
    </n-config-provider>
</template>
