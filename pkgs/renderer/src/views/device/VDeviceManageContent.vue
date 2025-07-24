<script setup lang="ts">
import { useDevice } from '@/states/device'

const { deviceId, activeDeviceInfo } = useDevice()
</script>

<template>
    <div v-if="deviceId && activeDeviceInfo" class="m-4 form-grid items-center gap-2">
        <span> 名称 </span>
        <span> {{ activeDeviceInfo.name }} </span>
        <span> Adb 路径 </span>
        <span> {{ activeDeviceInfo.adb_path }} </span>
        <span> 地址 </span>
        <span> {{ activeDeviceInfo.address }} </span>
    </div>
</template>
