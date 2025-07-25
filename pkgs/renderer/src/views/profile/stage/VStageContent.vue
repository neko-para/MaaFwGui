<script setup lang="ts">
import type { Interface, TaskId } from '@mfg/types'
import { NCard, NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import { AddOutlined, NavigateBeforeOutlined } from '@/icons'
import { requestDelTask, requestNewTask, syncProfile, useProfile } from '@/states/profile'
import { useInterface } from '@/states/project'

const router = useRouter()

const { profileId, stageId, activeStageInfo } = useProfile()

const { interfaceData } = useInterface(() => activeStageInfo.value?.project)

const taskOptions = computed(() => {
    return interfaceData.value?.task.map(task => {
        return {
            value: task.name,
            label: `${task.name} - ${task.entry}`
        } satisfies SelectMixedOption
    })
})

async function selectTask(tid: TaskId, task: string) {
    await window.main.task.update(profileId.value!, stageId.value!, tid, {
        task
    })
    await syncProfile()
}

function optionDefault(option: string) {
    return (
        interfaceData.value?.option?.[option].default_case ??
        interfaceData.value?.option?.[option].cases[0].name
    )
}

function optionOptions(option: string) {
    return interfaceData.value?.option?.[option].cases.map(cs => {
        return {
            value: cs.name,
            label: cs.name
        } satisfies SelectMixedOption
    })
}

async function selectOption(
    tid: TaskId,
    option: string,
    value: string,
    oldOptions?: Record<string, string>
) {
    await window.main.task.update(profileId.value!, stageId.value!, tid, {
        option: {
            ...oldOptions,
            [option]: value
        }
    })
    await syncProfile()
}
</script>

<template>
    <div v-if="profileId && stageId" class="m-4 flex flex-col gap-2">
        <div class="flex gap-2">
            <span class="text-xl"> 任务列表 </span>
            <div class="flex-1"></div>
            <m-icon-button @action="requestNewTask(profileId, stageId)">
                <add-outlined></add-outlined>
            </m-icon-button>
        </div>

        <n-card
            v-for="task in activeStageInfo?.tasks ?? []"
            :key="task.id"
            :title="task.task ?? '<未选择任务>'"
            closable
            @close="requestDelTask(profileId, stageId, task.id)"
            size="small"
        >
            <div class="m-4 form-grid items-center gap-2">
                <span> 任务 </span>
                <n-select
                    placeholder="选择任务"
                    :options="taskOptions"
                    :value="task.task"
                    @update:value="v => selectTask(task.id, v)"
                ></n-select>
                <template
                    v-for="option in interfaceData?.task.find(x => x.name === task.task)?.option ??
                    []"
                    :key="option"
                >
                    <span> {{ option }} </span>
                    <n-select
                        :placeholder="optionDefault(option)"
                        :options="optionOptions(option)"
                        :value="task.option?.[option] ?? null"
                        @update:value="v => selectOption(task.id, option, v, task.option)"
                    ></n-select>
                </template>
            </div>
            {{ task }}
        </n-card>
    </div>
</template>
