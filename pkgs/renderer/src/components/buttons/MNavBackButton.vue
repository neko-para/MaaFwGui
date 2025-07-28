<script setup lang="ts">
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'

const router = useRouter()
</script>

<template>
    <m-button @action="router.back()"> 返回 </m-button>
</template>
