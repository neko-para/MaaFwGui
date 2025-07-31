<script setup lang="ts">
import type { TaskId } from '@mfg/types'

import MButton from '@/components/MButton.vue'
import MDraggable from '@/components/MDraggable.vue'
import MTask from '@/components/MTask.vue'
import { requestNewTask, syncProfile, useProfile } from '@/states/profile'

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
</script>

<template>
    <div v-if="profileId && stageId" class="m-4 flex flex-col gap-2">
        <div class="flex gap-2">
            <span class="text-xl"> 任务列表 </span>
            <div class="flex-1"></div>
            <m-button :action="() => requestNewTask(profileId!, stageId!)" use-loading>
                新建
            </m-button>
        </div>

        <m-draggable
            :component="MTask"
            :items="activeStageInfo?.tasks ?? []"
            key-prop="id"
            half-gap="4px"
            :get-real="el => el.parentElement?.parentElement?.parentElement"
            @dragged="moveTask"
        >
            <template #anchor>
                <div>排序</div>
            </template>
        </m-draggable>
    </div>
</template>
