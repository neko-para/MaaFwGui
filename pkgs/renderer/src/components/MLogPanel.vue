<script setup lang="ts">
import { NScrollbar } from 'naive-ui'

defineProps<{
    type: string
    logs: string[]
}>()
</script>

<template>
    <div class="h-80 mt-auto flex flex-col gap-2">
        <span class="text-xl"> {{ type }} </span>
        <n-scrollbar class="p-2 flex flex-col">
            <div class="flex flex-col gap-0.5">
                <span v-for="(output, idx) of logs" :key="idx" class="wrap-anywhere">
                    {{ output }}
                </span>
            </div>
        </n-scrollbar>
    </div>
</template>
