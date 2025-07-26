<script setup lang="ts">
import { useDevice } from '@/states/device'

const { deviceId, activeDeviceInfo } = useDevice()
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <span class="text-xl"> 基础信息 </span>
        </div>

        <div v-if="deviceId && activeDeviceInfo" class="form-grid items-center gap-2">
            <span> 名称 </span>
            <span> {{ activeDeviceInfo.name }} </span>
            <span> Adb 路径 </span>
            <span> {{ activeDeviceInfo.adb_path }} </span>
            <span> 地址 </span>
            <span> {{ activeDeviceInfo.address }} </span>
        </div>
    </div>
</template>
