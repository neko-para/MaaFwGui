<script setup lang="ts">
import { NScrollbar } from 'naive-ui'
import { computed, onMounted, ref, watch } from 'vue'
import { nextTick } from 'vue'

import type { LaunchCache } from '@/states/launch'

import MButton from './MButton.vue'

const props = defineProps<{
    stageName: string
    cache: LaunchCache
}>()

const outsideEl = ref<HTMLDivElement | null>(null)
const containerEl = ref<HTMLDivElement | null>(null)

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

const isTrackingBottom = ref(true)

function onScroll(ev: Event) {
    if (containerEl.value) {
        isTrackingBottom.value =
            containerEl.value.clientHeight + containerEl.value.scrollTop + 10 >=
            containerEl.value.scrollHeight
    }
}

watch(
    () => logs.value.length,
    () => {
        if (isTrackingBottom.value) {
            nextTick(() => {
                if (containerEl.value) {
                    containerEl.value.scrollTop = containerEl.value.scrollHeight
                }
            })
        }
    }
)

onMounted(() => {
    nextTick(() => {
        containerEl.value = outsideEl.value?.querySelector('div.n-scrollbar-container') ?? null
    })
})
</script>

<template>
    <div ref="outsideEl" class="h-80 mt-auto flex flex-col gap-2">
        <div class="flex items-center justify-between gap-2">
            <span class="text-xl"> {{ title }} </span>
            <m-button v-if="cache.activeChanged" @action="resetFollow"> 跟随 </m-button>
        </div>
        <n-scrollbar class="p-2 flex flex-col" @scroll="onScroll">
            <div class="flex flex-col gap-0.5">
                <span v-for="(output, idx) of logs" :key="idx" class="wrap-anywhere select-text">
                    {{ output }}
                </span>
            </div>
        </n-scrollbar>
    </div>
</template>
