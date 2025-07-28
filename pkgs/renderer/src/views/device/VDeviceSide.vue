<script setup lang="ts">
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import LGenericSide from '@/layouts/LGenericSide.vue'
import { deviceInfo, requestScanDevices } from '@/states/device'

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
            <m-button :action="requestScanDevices" use-loading> 扫描 </m-button>
        </template>

        <template #itemEntry="{ item: dev }">
            <div class="flex flex-col items-start">
                <span class="text-lg"> {{ dev.name }} </span>
                <span> {{ dev.address }} </span>
            </div>
        </template>

        <template #itemActions> </template>
    </l-generic-side>
</template>
