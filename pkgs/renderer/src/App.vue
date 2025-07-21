<script setup lang="ts">
import type { SystemInfo } from '@mfg/types'
import { onMounted, ref } from 'vue'
import { RouterView } from 'vue-router'

const systemInfo = ref<SystemInfo>()

onMounted(async () => {
    systemInfo.value = await window.main.utils.querySystemInfo()
})
</script>

<template>
    <div class="flex flex-col h-full">
        <div class="w-screen h-7 pointer-events-none drag-window shrink-0"></div>
        <div class="flex min-h-0">
            <div class="h-full w-75">
                <router-view name="side"></router-view>
            </div>
            <div class="h-full flex-1">
                <router-view name="content"></router-view>
            </div>
        </div>
    </div>
</template>
