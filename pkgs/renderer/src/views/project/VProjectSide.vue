<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import MProjectEntry from '@/components/MProjectEntry.vue'
import MNavBackButton from '@/components/buttons/MNavBackButton.vue'
import { AddOutlined } from '@/icons'
import { projectInfo, requestNewProject, syncProjects, useProject } from '@/states/project'

const router = useRouter()

const { projectId } = useProject()
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex gap-2">
            <span class="text-xl"> 项目列表 </span>
            <div class="flex-1"></div>
            <m-nav-back-button></m-nav-back-button>
            <m-icon-button :action="requestNewProject" use-loading>
                <add-outlined></add-outlined>
            </m-icon-button>
        </div>
        <m-project-entry
            v-for="res in projectInfo"
            :key="res.id"
            @click="
                router.replace({
                    path: `/project/${res.id}`
                })
            "
        >
            {{ res.name + (res.id === projectId ? ' *' : '') }}
        </m-project-entry>
    </div>
</template>
