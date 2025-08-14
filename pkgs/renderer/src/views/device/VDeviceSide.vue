<script setup lang="ts">
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import LGenericSide from '@/layouts/LGenericSide.vue'
import { deviceInfo, requestDelDevice, requestScanDevices } from '@/states/device'
import { maaVersion } from '@/states/maa'

const router = useRouter()
</script>

<template>
    <l-generic-side
        title="设备列表"
        :items="deviceInfo"
        key-prop="id"
        @click="
            dev => {
                router.replace({
                    path: `/device/${dev.id}`
                })
            }
        "
    >
        <template #actions>
            <m-button :action="requestScanDevices" use-loading :disabled="!maaVersion">
                扫描
            </m-button>
        </template>

        <template #itemEntry="{ item: dev }">
            <div class="flex flex-col items-start">
                <span class="text-lg"> {{ dev.name === '' ? '<未命名设备>' : dev.name }} </span>
                <span> {{ dev.address }} </span>
            </div>
        </template>

        <template #itemActions="{ item: dev }">
            <m-button :action="() => requestDelDevice(dev.id)" use-loading> 删除 </m-button>
        </template>
    </l-generic-side>
</template>
