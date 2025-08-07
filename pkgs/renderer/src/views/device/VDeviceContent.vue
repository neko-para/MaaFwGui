<script setup lang="ts">
import type { ProfileId, StageId } from '@mfg/types'
import { NInput, NPopselect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import { syncDevices, useDevice } from '@/states/device'
import { findProfile, profileName, stageName } from '@/states/profile'

import { ProfileRevealStage } from '../profile'

const router = useRouter()

const { deviceId, activeDeviceInfo } = useDevice()

async function updateName(name: string) {
    await window.main.device.update(deviceId.value!, {
        name
    })
    await syncDevices()
}

const projectRef = ref<[ProfileId, StageId][]>([])

const projectRefOptions = computed(() => {
    return projectRef.value
        .map(([pid, sid]) => {
            const profile = findProfile(pid)
            if (!profile) {
                return null
            }
            const pname = profileName(pid)
            const sname = stageName(profile, sid)
            return {
                value: [pid, sid].join(','),
                label: `${pname} - ${sname}`
            } satisfies SelectMixedOption
        })
        .filter(x => !!x)
})

function revealStage(info: string) {
    const [pid, sid] = info.split(',')
    router.back()
    router.replace({
        path: `/profile/${pid}`
    })
    setTimeout(() => {
        ProfileRevealStage.value(sid as StageId)
    }, 1)
}

watch(
    () => deviceId.value,
    async id => {
        projectRef.value = id ? await window.main.device.queryRef(id) : []
    },
    {
        immediate: true
    }
)
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <span class="text-xl"> 基础信息 </span>
        </div>

        <div v-if="deviceId && activeDeviceInfo" class="form-grid items-center gap-2">
            <span> 名称 </span>
            <n-input
                placeholder="输入新名称"
                :value="activeDeviceInfo.name"
                @update:value="updateName"
                size="small"
            ></n-input>
            <span> Adb 路径 </span>
            <span> {{ activeDeviceInfo.adb_path }} </span>
            <span> 地址 </span>
            <span> {{ activeDeviceInfo.address }} </span>
            <template v-if="projectRef.length > 0">
                <span> </span>
                <div class="flex items-center gap-2">
                    <n-popselect
                        trigger="hover"
                        :options="projectRefOptions"
                        @update:value="revealStage"
                    >
                        <m-button> 查看引用 </m-button>
                    </n-popselect>
                </div>
            </template>
        </div>
    </div>
</template>
