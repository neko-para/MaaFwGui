<script setup lang="ts">
import { NButton, NCard, NInput, NModal, NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import LGenericSide from '@/layouts/LGenericSide.vue'
import {
    projectInfo,
    requestDelProject,
    requestNewExternalProject,
    requestNewGithubReleaseProject,
    useProject
} from '@/states/project'

const router = useRouter()

const { projectId } = useProject()
</script>

<template>
    <l-generic-side
        title="项目列表"
        :items="projectInfo"
        key-prop="id"
        @click="
            project => {
                router.replace({
                    path: `/project/${project.id}`
                })
            }
        "
    >
        <template #actions>
            <m-button
                @action="
                    () => {
                        router.push({
                            path: '/github-repo'
                        })
                    }
                "
            >
                GH
            </m-button>
            <m-button :action="requestNewExternalProject" use-loading> 导入 </m-button>
        </template>

        <template #itemEntry="{ item: project }">
            <span class="text-xl">
                {{ project.name + (project.id === projectId ? ' *' : '') }}
            </span>
        </template>

        <template #itemActions="{ item: project }">
            <m-button :action="async () => requestDelProject(project.id)" use-loading>
                删除
            </m-button>
        </template>
    </l-generic-side>
</template>
