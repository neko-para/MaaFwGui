<script setup lang="ts">
import type { AdbDeviceId, Interface, InterfaceConfig } from '@mfg/types'
import { NButton, NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import { SmartphoneOutlined } from '@/icons'
import { deviceInfo } from '@/states/device'
import { useProject } from '@/states/project'

const { activeProjectInfo, projectId } = useProject()

const router = useRouter()

const interfaceData = ref<Interface | null>(null)

watch(
    () => projectId.value,
    id => {
        if (id) {
            window.main.project.loadInterface(id).then(i => {
                interfaceData.value = i
            })
            // window.main.project.loadConfig(id).then(i => {
            //     interfaceConfig.value = i
            // })
        }
    },
    {
        immediate: true
    }
)
/*

const interfaceConfig = ref<InterfaceConfig | null>(null)

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

function selectResource(name: string) {
    window.main.project.updateConfig(projectId.value!, {
        resource: name
    })
}

function selectController(name: string) {
    window.main.project.updateConfig(projectId.value!, {
        controller: name
    })
}

const controllerMeta = computed(() => {
    return interfaceData.value?.controller.find(
        ctrl => ctrl.name === interfaceConfig.value?.controller
    )
})

const deviceOptions = computed(() => {
    return deviceInfo.value.map(dev => {
        return {
            value: dev.id,
            label: `${dev.name} - ${dev.address}`
        } satisfies SelectMixedOption
    })
})

function selectDevice(deviceId: AdbDeviceId) {
    window.main.project.updateConfig(projectId.value!, {
        adb: deviceId
    })
}

*/
</script>

<template>
    <div v-if="activeProjectInfo && interfaceData" class="m-4 form-grid items-center gap-2">
        <span> 名称 </span>
        <span> {{ activeProjectInfo.name }} </span>
        <span> 路径 </span>
        <span> {{ activeProjectInfo.path }} </span>
        <span> 类型 </span>
        <span> {{ activeProjectInfo.type === 'external' ? '外部' : '托管' }} </span>
        <!--
        <span> 资源 </span>
        <div>
            <n-select
                placeholder="选择资源"
                :options="resourceOptions"
                :value="interfaceConfig?.resource"
                @update:value="selectResource"
            ></n-select>
        </div>
        <span> 控制器 </span>
        <n-select
            placeholder="选择控制器"
            :options="controllerOptions"
            :value="interfaceConfig?.controller"
            @update:value="selectController"
        ></n-select>
        <template v-if="controllerMeta?.type === 'Adb'">
            <span> 设备 </span>
            <div class="flex items-center gap-2">
                <n-select
                    placeholder="选择设备"
                    :options="deviceOptions"
                    :value="interfaceConfig?.adb"
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
        <span></span>
        <div>
            <n-button> 开始使用 </n-button>
        </div>
        -->
    </div>
</template>
