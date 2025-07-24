<script setup lang="ts">
import { NButton } from 'naive-ui'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import MEntry from '@/components/MEntry.vue'
import MIconButton from '@/components/MIconButton.vue'
import { LinkOutlined, NavigateBeforeOutlined, RefreshOutlined } from '@/icons'
import { deviceInfo, requestScanDevices, syncDevices } from '@/states/device'

const router = useRouter()

onMounted(() => {
    syncDevices()
})
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex gap-2">
            <span class="text-xl font-bold"> 已连接的设备 </span>
            <div class="flex-1"></div>
            <m-icon-button @action="router.back()">
                <navigate-before-outlined></navigate-before-outlined>
            </m-icon-button>
        </div>
        <div class="flex gap-2">
            <span class="text-xl font-bold"> 其它设备 </span>
            <div class="flex-1"></div>
            <m-icon-button :action="requestScanDevices" use-loading>
                <refresh-outlined />
            </m-icon-button>
        </div>
        <div v-for="(dev, idx) of deviceInfo" :key="idx" class="flex items-center gap-2">
            <m-entry
                @click="
                    router.replace({
                        path: `/device/${dev.id}`
                    })
                "
            >
                <div class="flex flex-col items-start">
                    <span class="text-lg"> {{ dev.name }} </span>
                    <span> {{ dev.address }} </span>
                </div>
            </m-entry>
            <div class="flex-1"></div>
            <m-icon-button>
                <link-outlined />
            </m-icon-button>
        </div>
    </div>
</template>
