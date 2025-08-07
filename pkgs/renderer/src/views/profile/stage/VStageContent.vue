<script setup lang="ts">
import type { StageInfo, TaskId } from '@mfg/types'
import { onMounted, ref } from 'vue'

import MButton from '@/components/MButton.vue'
import MDraggable from '@/components/MDraggable.vue'
import MTask from '@/components/MTask.vue'
import { requestNewTask, syncProfile, useProfile } from '@/states/profile'

import { StageRevealTask } from '.'

export type ComponentExposed<T> = T extends new (...args: any) => infer E
    ? E
    : T extends (props: any, ctx: any, expose: (exposed: infer E) => any, ...args: any) => any
      ? NonNullable<E>
      : {}

const { profileId, stageId, activeStageInfo } = useProfile()

async function moveTask(from: string, to: string, before: boolean) {
    await window.main.task.move(
        profileId.value!,
        stageId.value!,
        from as TaskId,
        to as TaskId,
        before
    )
    await syncProfile()
}

const draggableEl = ref<ComponentExposed<typeof MDraggable<StageInfo>> | null>(null)

onMounted(() => {
    StageRevealTask.value = task => {
        draggableEl.value?.revealItem(task)
    }
})
</script>

<template>
    <div v-if="profileId && stageId" class="m-4 flex flex-col gap-2 min-h-0">
        <div class="flex gap-2">
            <span class="text-xl"> 任务列表 </span>
            <div class="flex-1"></div>
            <m-button :action="() => requestNewTask(profileId!, stageId!)" use-loading>
                新建
            </m-button>
        </div>

        <m-draggable
            ref="draggableEl"
            :comp="MTask"
            :items="activeStageInfo?.tasks ?? []"
            key-prop="id"
            half-gap="4px"
            :get-real="el => el.parentElement?.parentElement?.parentElement?.parentElement"
            @dragged="moveTask"
        >
            <template #anchor>
                <m-button class="pointer-events-none">排序</m-button>
            </template>
        </m-draggable>
    </div>
</template>
