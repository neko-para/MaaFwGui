<script setup lang="ts">
import type { ProjectId, StageId } from '@mfg/types'
import { NCard, NInput, NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { requestDelStage, syncProfile, useProfile } from '@/states/profile'
import { projectInfo } from '@/states/project'

import MButton from './MButton.vue'
import MConfigProject from './MConfigProject.vue'

const router = useRouter()

const props = defineProps<{
    id: StageId
}>()

const { activeProfileInfo, profileId } = useProfile()

const stageMeta = computed(() => {
    return activeProfileInfo.value?.stages.find(x => x.id === props.id)
})

const projectMeta = computed(() => {
    return projectInfo.value.find(x => x.id === stageMeta.value?.project)
})

const projectOptions = computed(() => {
    return projectInfo.value.map(proj => {
        return {
            value: proj.id,
            label: proj.name === '' ? '<未命名项目>' : proj.name
        } satisfies SelectMixedOption
    })
})

async function updateStageName(name: string) {
    await window.main.stage.update(profileId.value!, props.id, {
        name
    })
    await syncProfile()
}

async function selectProject(project: ProjectId) {
    await window.main.stage.update(profileId.value!, props.id, {
        project,
        controller: undefined,
        resource: undefined,
        adb: undefined,
        tasks: []
    })
    await syncProfile()
}
</script>

<template>
    <n-card
        v-if="profileId && activeProfileInfo && stageMeta"
        :title="stageMeta.name === '' ? '<未命名步骤>' : stageMeta.name"
        closable
        @close="requestDelStage(profileId, stageMeta.id)"
        size="small"
    >
        <template #header-extra>
            <slot name="anchor"></slot>
        </template>

        <div class="form-grid items-center gap-2">
            <span> 名称 </span>
            <n-input
                placeholder="输入新名称"
                :value="stageMeta.name"
                @update:value="updateStageName"
                size="small"
            ></n-input>
            <span> 项目 </span>
            <div class="flex items-center gap-2">
                <n-select
                    placeholder="选择项目"
                    :options="projectOptions"
                    :value="stageMeta.project"
                    @update:value="selectProject"
                    size="small"
                ></n-select>
                <m-button
                    @action="
                        router.push({
                            path: stageMeta.project ? `/project/${stageMeta.project}` : '/project'
                        })
                    "
                >
                    管理项目
                </m-button>
            </div>
            <template v-if="projectMeta">
                <m-config-project :stage="stageMeta" :project="projectMeta"></m-config-project>
            </template>
        </div>
    </n-card>
</template>
