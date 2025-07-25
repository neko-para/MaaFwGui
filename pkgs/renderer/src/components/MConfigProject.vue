<script setup lang="ts">
import type { AdbDeviceId, ProjectInfo, StageInfo } from '@mfg/types'
import { NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import { SettingsOutlined, SmartphoneOutlined } from '@/icons'
import { deviceInfo } from '@/states/device'
import { syncProfile, useProfile } from '@/states/profile'
import { useInterface } from '@/states/project'

const props = defineProps<{
    stage: StageInfo
    project: ProjectInfo
}>()

const router = useRouter()

const { profileId } = useProfile()

const { interfaceData } = useInterface(() => props.project.id)

const resourceOptions = computed(() => {
    return (
        interfaceData.value?.resource.map(res => {
            return {
                value: res.name,
                label: res.name
            } satisfies SelectMixedOption
        }) ?? []
    )
})

const controllerOptions = computed(() => {
    return (
        interfaceData.value?.controller.map(res => {
            return {
                value: res.name,
                label: `${res.name} - ${res.type}`
            } satisfies SelectMixedOption
        }) ?? []
    )
})

async function selectResource(name: string) {
    await window.main.stage.update(profileId.value!, props.stage.id, {
        resource: name
    })
    await syncProfile()
}

async function selectController(name: string) {
    await window.main.stage.update(profileId.value!, props.stage.id, {
        controller: name
    })
    await syncProfile()
}

const controllerMeta = computed(() => {
    return interfaceData.value?.controller.find(ctrl => ctrl.name === props.stage.controller)
})

const deviceOptions = computed(() => {
    return deviceInfo.value.map(dev => {
        return {
            value: dev.id,
            label: `${dev.name} - ${dev.address}`
        } satisfies SelectMixedOption
    })
})

async function selectDevice(deviceId: AdbDeviceId) {
    await window.main.stage.update(profileId.value!, props.stage.id, {
        adb: deviceId
    })
    await syncProfile()
}
</script>

<template>
    <span> 资源 </span>
    <div>
        <n-select
            placeholder="选择资源"
            :options="resourceOptions"
            :value="stage.resource"
            @update:value="selectResource"
        ></n-select>
    </div>
    <span> 控制器 </span>
    <n-select
        placeholder="选择控制器"
        :options="controllerOptions"
        :value="stage.controller"
        @update:value="selectController"
    ></n-select>
    <template v-if="controllerMeta?.type === 'Adb'">
        <span> 设备 </span>
        <div class="flex items-center gap-2">
            <n-select
                placeholder="选择设备"
                :options="deviceOptions"
                :value="stage.adb"
                @update:value="selectDevice"
            ></n-select>
            <m-icon-button
                @action="
                    router.push({
                        path: `/device`
                    })
                "
            >
                <smartphone-outlined></smartphone-outlined>
            </m-icon-button>
        </div>
    </template>
    <span> 任务 </span>
    <div class="flex items-center gap-2">
        <span> 已配置{{ stage.tasks?.length ?? 0 }}个任务 </span>
        <div class="flex-1"></div>
        <m-icon-button
            @action="
                router.push({
                    path: `/profile/${profileId}/stage/${stage.id}`
                })
            "
        >
            <settings-outlined></settings-outlined>
        </m-icon-button>
    </div>
</template>
