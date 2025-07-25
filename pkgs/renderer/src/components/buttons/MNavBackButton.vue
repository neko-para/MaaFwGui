<script setup lang="ts">
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import { NavigateBeforeOutlined } from '@/icons'

const router = useRouter()
</script>

<template>
    <m-icon-button @action="router.back()">
        <navigate-before-outlined></navigate-before-outlined>
    </m-icon-button>
</template>
