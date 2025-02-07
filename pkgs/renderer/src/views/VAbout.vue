<script setup lang="ts">
import { onMounted, ref } from 'vue'

const fwVer = ref('')
const guiVer = ref('')

onMounted(async () => {
    fwVer.value = await window.main.misc.MaaFwVersion()
    guiVer.value = await window.main.misc.MaaFwGuiVersion()
})
</script>

<template>
    <div class="flex flex-col gap-2">
        <span> MaaFramework: {{ fwVer }} </span>
        <span> MaaFrameworkGui: {{ guiVer }} </span>
    </div>
</template>
