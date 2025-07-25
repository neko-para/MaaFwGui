<script setup lang="ts">
import { useInterface, useProject } from '@/states/project'

const { activeProjectInfo, projectId } = useProject()

const { interfaceData } = useInterface(() => projectId.value)
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
