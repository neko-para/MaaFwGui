<script setup lang="ts">
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import MProjectEntry from '@/components/project/MProjectEntry.vue'
import { MoreHorizOutlined } from '@/icons'
import { projectInfo } from '@/states/project'

import { useProject } from './VProjectState'

const router = useRouter()
const { projectId, activeProjectInfo } = useProject()
</script>

<template>
    <div v-if="activeProjectInfo" class="m-4 flex flex-col gap-2">
        <div class="flex gap-2 justify-between">
            <span class="text-xl font-bold"> 当前项目 </span>
            <m-icon-button
                :action="
                    () => {
                        router.replace({
                            path: '/project'
                        })
                    }
                "
            >
                <more-horiz-outlined></more-horiz-outlined>
            </m-icon-button>
        </div>
        <m-project-entry> {{ activeProjectInfo.name }} </m-project-entry>
        <div class="flex gap-2 justify-between">
            <span class="text-xl font-bold"> 其它项目 </span>
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
