<script setup lang="ts">
import type { AdbDeviceId, Interface, ProjectInfo, StageId, StageInfo } from '@mfg/types'
import { NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import { SmartphoneOutlined } from '@/icons'
import { deviceInfo } from '@/states/device'
import { syncProfile, useProfile } from '@/states/profile'

const props = defineProps<{
    stage: StageInfo
    project: ProjectInfo
}>()

const router = useRouter()

const { profileId } = useProfile()

const interfaceData = ref<Interface | null>(null)

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

onMounted(async () => {
    interfaceData.value = await window.main.project.loadInterface(props.project.id)
})
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
</template>
