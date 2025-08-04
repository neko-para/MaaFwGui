<script setup lang="ts">
import type { ProjectId } from '@mfg/types'
import { NButton, NCard, NInput, NModal } from 'naive-ui'
import { computed, ref } from 'vue'

import { requestBindMirrorcProject, requestNewMirrorcProject } from '@/states/project'

const props = defineProps<{
    project?: ProjectId
}>()

const showDlg = ref(false)

const waitAdd = ref<(v: boolean) => void>(() => {})
const loading = ref(false)

const mirrorcRid = ref<string>('')
const mirrorcRidValid = computed(() => {
    return !!mirrorcRid.value
})

async function addMirrorc() {
    showDlg.value = true

    const { promise, resolve } = Promise.withResolvers()
    waitAdd.value = resolve
    if (!(await promise)) {
        showDlg.value = false
        return
    }

    loading.value = true

    if (props.project) {
        await requestBindMirrorcProject(props.project, mirrorcRid.value)
    } else {
        await requestNewMirrorcProject(mirrorcRid.value)
    }

    loading.value = false
    showDlg.value = false
}

defineExpose({
    addMirrorc: addMirrorc
})
</script>

<template>
    <n-modal :show="showDlg" @update:show="waitAdd(false)">
        <n-card title="添加 Mirrorc" class="max-w-2/3" role="dialog">
            <div class="flex flex-col gap-2">
                <n-input
                    placeholder="rid"
                    v-model:value="mirrorcRid"
                    size="small"
                    :status="mirrorcRidValid ? 'success' : 'error'"
                ></n-input>
            </div>

            <template #footer>
                <n-button @click="waitAdd(true)" :loading="loading" :disabled="!mirrorcRidValid">
                    添加
                </n-button>
            </template>
        </n-card>
    </n-modal>
</template>
