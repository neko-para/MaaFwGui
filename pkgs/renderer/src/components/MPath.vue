<script setup lang="ts">
import { NInput } from 'naive-ui'

import MButton from './MButton.vue'

const props = defineProps<{
    path: string
}>()

async function open() {
    await window.main.misc.revealPath(props.path)
}
</script>

<template>
    <div class="flex gap-2 items-center">
        <n-input :value="path" readonly size="small"></n-input>
        <m-button :action="open" use-loading> 打开 </m-button>
    </div>
</template>
