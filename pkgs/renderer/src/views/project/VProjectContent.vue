<script setup lang="ts">
import type { Interface } from '@mfg/types'
import { NButton, NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { computed, onMounted, ref } from 'vue'

import { useProject } from './VProjectState'

const { activeProjectInfo } = useProject()

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

onMounted(() => {
    window.main.project.load(activeProjectInfo.value!.id).then(i => {
        interfaceData.value = i
    })
})
</script>

<template>
    <div v-if="activeProjectInfo && interfaceData" class="m-4 form-grid items-center gap-2">
        <span> 名称 </span>
        <span> {{ activeProjectInfo.name }} </span>
        <span> 路径 </span>
        <span> {{ activeProjectInfo.path }} </span>
        <span> 资源 </span>
        <div>
            <n-select placeholder="选择资源" :options="resourceOptions"></n-select>
        </div>
        <span></span>
        <div>
            <n-button> 开始使用 </n-button>
        </div>
    </div>
</template>
