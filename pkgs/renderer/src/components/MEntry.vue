<script setup lang="ts">
import { NButton } from 'naive-ui'

defineEmits<{
    click: []
}>()
</script>

<template>
    <div class="mx-2 flex justify-start">
        <n-button text :focusable="false" @click="$emit('click')">
            <slot></slot>
        </n-button>
    </div>
</template>
