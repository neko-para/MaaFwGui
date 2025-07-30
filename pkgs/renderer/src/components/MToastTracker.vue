<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { onMounted, onUnmounted, ref } from 'vue'

const message = useMessage()
const unbind = ref(() => {})

onMounted(() => {
    unbind.value = window.renderer.utils.showToast((category, msg) => {
        message[category](msg, { keepAliveOnHover: true })
    })
})

onUnmounted(() => {
    unbind.value()
})
</script>

<template></template>
