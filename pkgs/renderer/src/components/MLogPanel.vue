<script setup lang="ts">
import { NScrollbar } from 'naive-ui'
import { computed } from 'vue'

import type { LaunchCache } from '@/states/launch'

import MButton from './MButton.vue'

const props = defineProps<{
    stageName: string
    cache: LaunchCache
}>()

const title = computed(() => {
    if (!props.cache.activeOutput) {
        return ''
    }
    switch (props.cache.activeOutput.type) {
        case 'agent':
            return `${props.stageName} Agent日志`
        case 'focus':
            return `${props.stageName} 执行日志`
    }
    return ''
})

const logs = computed<string[]>(() => {
    if (!props.cache.activeOutput) {
        return []
    }
    switch (props.cache.activeOutput.type) {
        case 'agent':
            return props.cache.agentOutput?.[props.cache.activeOutput.stage] ?? []
        case 'focus':
            return props.cache.focusOutput?.[props.cache.activeOutput.stage] ?? []
    }
    return []
})

function resetFollow() {
    props.cache.activeChanged = false
    props.cache.activeOutput = props.cache.latestOutput
}
</script>

<template>
    <div class="h-80 mt-auto flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2">
            <span class="text-xl"> {{ title }} </span>
            <m-button v-if="cache.activeChanged" @action="resetFollow"> 跟随 </m-button>
        </div>
        <n-scrollbar class="p-2 flex flex-col">
            <div class="flex flex-col gap-0.5">
                <span v-for="(output, idx) of logs" :key="idx" class="wrap-anywhere">
                    {{ output }}
                </span>
            </div>
        </n-scrollbar>
    </div>
</template>
