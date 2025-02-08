<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { ref } from 'vue'

const props = defineProps<{
    action: () => Promise<void> | void
}>()

const running = ref(false)

async function doAction() {
    running.value = true
    await props.action()
    running.value = false
}
</script>

<template>
    <n-button text @click="doAction" :loading="running" :focusable="false">
        <template #icon>
            <n-icon size="24">
                <slot></slot>
            </n-icon>
        </template>
    </n-button>
</template>
