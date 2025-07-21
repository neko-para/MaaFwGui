<script setup lang="ts">
import { NButton } from 'naive-ui'

defineEmits<{
    click: []
}>()
</script>

<template>
    <div class="mx-2 flex justify-start">
        <n-button text :focusable="false" @click="$emit('click')">
            <span class="text-lg">
                <slot></slot>
            </span>
        </n-button>
    </div>
</template>
