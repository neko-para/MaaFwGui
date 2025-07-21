<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import MProjectEntry from '@/components/project/MProjectEntry.vue'
import { AddOutlined } from '@/icons'
import { initProjects, projectInfo, requestNewProject } from '@/states/project'

const router = useRouter()

onMounted(async () => {
    initProjects()
})
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex gap-2 justify-between">
            <span class="text-xl font-bold"> 项目列表 </span>
            <m-icon-button :action="requestNewProject">
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
