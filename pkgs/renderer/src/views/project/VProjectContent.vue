<script setup lang="ts">
import type { AdbDeviceId, Interface } from '@mfg/types'
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
        }
    },
    {
        immediate: true
    }
)
</script>

<template>
    <div v-if="activeProjectInfo && interfaceData" class="m-4 form-grid items-center gap-2">
        <span> 名称 </span>
        <span> {{ activeProjectInfo.name }} </span>
        <span> 路径 </span>
        <span> {{ activeProjectInfo.path }} </span>
        <span> 类型 </span>
        <span> {{ activeProjectInfo.type === 'external' ? '外部' : '托管' }} </span>
    </div>
</template>
