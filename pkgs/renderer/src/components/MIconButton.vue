<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { ref } from 'vue'

const props = withDefaults(
    defineProps<{
        action?: () => Promise<void> | void
        useLoading?: boolean
    }>(),
    {
        useLoading: false
    }
)

const emits = defineEmits<{
    action: []
}>()

const running = ref(false)

async function doAction() {
    if (props.useLoading) {
        running.value = true
        await props.action?.()
        running.value = false
    } else {
        emits('action')
    }
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
