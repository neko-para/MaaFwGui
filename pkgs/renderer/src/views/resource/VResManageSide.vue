<script setup lang="ts">
import type { ResourceInfo } from '@mfg/types/resource'
import { AddOutlined, MoreHorizOutlined } from '@vicons/material'
import { NButton, NIcon } from 'naive-ui'
import { onMounted, ref } from 'vue'

import MIconButton from '@/components/MIconButton.vue'
import MResEntry from '@/components/resource/MResEntry.vue'
import { activeResource, activeResourceInfo } from '@/states/resource'

const resourceInfo = ref<ResourceInfo[]>([])

async function requestNewResource() {
    await window.main.resource.new()
    resourceInfo.value = await window.main.resource.query()
}

onMounted(async () => {
    resourceInfo.value = await window.main.resource.query()
})
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <template v-if="!activeResourceInfo">
            <div class="flex gap-2 justify-between">
                <span class="text-xl font-bold"> 资源列表 </span>
                <m-icon-button :action="requestNewResource">
                    <add-outlined></add-outlined>
                </m-icon-button>
            </div>

            <m-res-entry
                v-for="res in resourceInfo"
                :key="res.id"
                @click="activeResourceInfo = res"
            >
                {{ res.name }}
            </m-res-entry>
        </template>
        <template v-else>
            <div class="flex gap-2 justify-between">
                <span class="text-xl font-bold"> 当前资源 </span>
                <m-icon-button
                    :action="
                        () => {
                            activeResourceInfo = null
                        }
                    "
                >
                    <more-horiz-outlined></more-horiz-outlined>
                </m-icon-button>
            </div>

            <m-res-entry>
                {{ activeResourceInfo.name }}
            </m-res-entry>

            <div class="flex gap-2 justify-between">
                <span class="text-xl font-bold"> 其它资源 </span>
            </div>

            <template v-for="res in resourceInfo" :key="res.id">
                <m-res-entry v-if="res.id !== activeResource" @click="activeResourceInfo = res">
                    {{ res.name }}
                </m-res-entry>
            </template>
        </template>
    </div>
</template>
