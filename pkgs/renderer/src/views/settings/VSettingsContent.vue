<script setup lang="ts">
import { NCard } from 'naive-ui'
import { onMounted, ref } from 'vue'

const fwVer = ref('')
const guiVer = ref('')

onMounted(async () => {
    fwVer.value = await window.main.misc.MaaFwVersion()
    guiVer.value = await window.main.misc.MaaFwGuiVersion()
})
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex gap-2">
            <span class="text-xl"> 关于 </span>
        </div>

        <div class="form-grid items-center gap-2">
            <span> MaaFramework </span>
            <span> {{ fwVer }} </span>
            <span> MaaFrameworkGui </span>
            <span> {{ guiVer }} </span>
        </div>
    </div>
</template>
