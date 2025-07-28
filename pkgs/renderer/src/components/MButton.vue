<script setup lang="ts">
import { NButton } from 'naive-ui'
import { ref } from 'vue'

const props = withDefaults(
    defineProps<{
        disabled?: boolean
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
    <n-button
        @click="doAction"
        :loading="running"
        :focusable="false"
        :disabled="disabled"
        size="small"
    >
        <slot></slot>
    </n-button>
</template>
