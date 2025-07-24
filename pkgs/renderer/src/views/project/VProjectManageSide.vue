<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import MProjectEntry from '@/components/MProjectEntry.vue'
import { AddOutlined, NavigateBeforeOutlined } from '@/icons'
import { projectInfo, requestNewProject, syncProjects } from '@/states/project'

const router = useRouter()

onMounted(async () => {
    syncProjects()
})
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex gap-2">
            <span class="text-xl"> 项目列表 </span>
            <div class="flex-1"></div>
            <m-icon-button @action="router.back()">
                <navigate-before-outlined></navigate-before-outlined>
            </m-icon-button>
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
            {{ res.name }}
        </m-project-entry>
    </div>
</template>
