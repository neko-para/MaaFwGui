<script setup lang="ts">
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import MProjectEntry from '@/components/MProjectEntry.vue'
import { MoreHorizOutlined, NavigateBeforeOutlined } from '@/icons'
import { projectInfo, useProject } from '@/states/project'

const router = useRouter()
const { projectId, activeProjectInfo } = useProject()
</script>

<template>
    <div v-if="activeProjectInfo" class="m-4 flex flex-col gap-2">
        <div class="flex gap-2">
            <span class="text-xl"> 当前项目 </span>
            <div class="flex-1"></div>
            <m-icon-button @action="router.back()">
                <navigate-before-outlined></navigate-before-outlined>
            </m-icon-button>
            <m-icon-button
                @action="
                    router.replace({
                        path: '/project'
                    })
                "
            >
                <more-horiz-outlined></more-horiz-outlined>
            </m-icon-button>
        </div>
        <m-project-entry> {{ activeProjectInfo.name }} </m-project-entry>
        <div class="flex gap-2 justify-between">
            <span class="text-xl"> 其它项目 </span>
        </div>
        <template v-for="res in projectInfo" :key="res.id">
            <m-project-entry
                v-if="res.id !== projectId"
                @click="
                    router.replace({
                        path: `/project/${res.id}`
                    })
                "
            >
                {{ res.name }}
            </m-project-entry>
        </template>
    </div>
</template>
