<script setup lang="ts">
import { NButton } from 'naive-ui'

import { activeResourceInfo } from '@/states/resource'
</script>

<template>
    <div v-if="activeResourceInfo" class="m-4 form-grid gap-2">
        <span> 名称 </span>
        <span> {{ activeResourceInfo.name }} </span>
        <span> 路径 </span>
        <span> {{ activeResourceInfo.path }} </span>
    </div>
</template>
