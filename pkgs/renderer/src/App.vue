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
    <div class="fixed top-0 w-screen h-10 pointer-events-none drag-window"></div>
    <div class="h-full w-75">
        <div v-if="systemInfo?.platform === 'darwin'" class="h-7"></div>
        <router-view name="side"></router-view>
    </div>
    <div class="h-full flex-1">
        <router-view name="content"></router-view>
    </div>
</template>
