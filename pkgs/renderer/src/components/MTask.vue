<script setup lang="ts">
import type { TaskId, TaskInfo } from '@mfg/types'
import { NCard, NSelect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { computed } from 'vue'

import { requestDelTask, requestDupTask, syncProfile, useProfile } from '@/states/profile'
import { useInterface } from '@/states/project'

import MButton from './MButton.vue'

defineProps<{
    item: TaskInfo
}>()

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
    <n-card
        :title="item.task ?? '<未选择任务>'"
        closable
        @close="requestDelTask(profileId!, stageId!, item.id)"
        size="small"
    >
        <template #header-extra>
            <div class="flex items-center gap-2">
                <slot name="anchor"></slot>
                <m-button
                    :action="async () => requestDupTask(profileId!, stageId!, item.id)"
                    use-loading
                >
                    复制
                </m-button>
            </div>
        </template>

        <div class="form-grid items-center gap-2">
            <span> 任务 </span>
            <n-select
                placeholder="选择任务"
                :options="taskOptions"
                :value="item.task"
                @update:value="v => selectTask(item.id, v)"
                size="small"
            ></n-select>
            <template
                v-for="option in interfaceData?.task.find(x => x.name === item.task)?.option ?? []"
                :key="option"
            >
                <span> {{ option }} </span>
                <n-select
                    :placeholder="optionDefault(option)"
                    :options="optionOptions(option)"
                    :value="item.option?.[option] ?? null"
                    @update:value="v => selectOption(item.id, option, v, item.option)"
                    size="small"
                ></n-select>
            </template>
        </div>
    </n-card>
</template>
