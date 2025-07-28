<script setup lang="ts">
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import { LinkOutlined, RefreshOutlined } from '@/icons'
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
            <m-icon-button :action="requestScanDevices" use-loading>
                <refresh-outlined />
            </m-icon-button>
        </template>

        <template #itemEntry="{ item: dev }">
            <div class="flex flex-col items-start">
                <span class="text-lg"> {{ dev.name }} </span>
                <span> {{ dev.address }} </span>
            </div>
        </template>

        <template #itemActions>
            <m-icon-button>
                <link-outlined />
            </m-icon-button>
        </template>
    </l-generic-side>
</template>
