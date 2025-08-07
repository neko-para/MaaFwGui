<script setup lang="ts">
import type { AdbDeviceId, ProjectInfo, StageId, StageInfo, TaskId } from '@mfg/types'
import { NPopselect, NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import { deviceInfo } from '@/states/device'
import { syncProfile, useProfile } from '@/states/profile'
import { useInterface } from '@/states/project'
import { StageRevealTask } from '@/views/profile/stage'

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
            label: dev.name !== '' ? `${dev.name} - ${dev.address}` : dev.address
        } satisfies SelectMixedOption
    })
})

async function selectDevice(deviceId: AdbDeviceId) {
    await window.main.stage.update(profileId.value!, props.stage.id, {
        adb: deviceId
    })
    await syncProfile()
}

const tasksOptions = computed(() => {
    return (
        props.stage.tasks?.map(task => {
            return {
                value: task.id,
                label: task.task ?? '<未选择任务>'
            } satisfies SelectMixedOption
        }) ?? []
    )
})

function revealTask(task: TaskId) {
    router.push({
        path: `/profile/${profileId.value}/stage/${props.stage.id}`
    })
    setTimeout(() => {
        StageRevealTask.value(task)
    }, 1)
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
            size="small"
        ></n-select>
    </div>
    <span> 控制器 </span>
    <n-select
        placeholder="选择控制器"
        :options="controllerOptions"
        :value="stage.controller"
        @update:value="selectController"
        size="small"
    ></n-select>
    <template v-if="controllerMeta?.type === 'Adb'">
        <span> 设备 </span>
        <div class="flex items-center gap-2">
            <n-select
                placeholder="选择设备"
                :options="deviceOptions"
                :value="stage.adb"
                @update:value="selectDevice"
                size="small"
            ></n-select>
            <m-button
                @action="
                    router.push({
                        path: stage.adb ? `/device/${stage.adb}` : '/device'
                    })
                "
            >
                管理设备
            </m-button>
        </div>
    </template>
    <span> 任务 </span>
    <div class="flex items-center gap-2">
        <n-popselect
            v-if="stage.tasks && stage.tasks.length > 0"
            trigger="hover"
            :options="tasksOptions"
            @update:value="revealTask"
            scrollable
        >
            <span> 已配置{{ stage.tasks.length }}个任务 </span>
        </n-popselect>
        <span v-else> 未配置任务 </span>

        <div class="flex-1"></div>
        <m-button
            @action="
                router.push({
                    path: `/profile/${profileId}/stage/${stage.id}`
                })
            "
        >
            配置任务
        </m-button>
    </div>
</template>
