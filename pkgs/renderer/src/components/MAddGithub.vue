<script setup lang="ts">
import type { ProjectId } from '@mfg/types'
import { NButton, NCard, NInput, NModal } from 'naive-ui'
import { computed, ref } from 'vue'

import { requestBindGithubProject, requestNewGithubProject } from '@/states/project'

const props = defineProps<{
    project?: ProjectId
}>()

const showDlg = ref(false)

const waitAdd = ref<(v: boolean) => void>(() => {})
const loading = ref(false)

const githubUrl = ref<string>('')
const githubUrlValid = computed(() => {
    return (
        !!githubUrl.value &&
        (/^https?:\/\/github.com\/[^/]+\/[^/]+(?:.git|\/)?$/.test(githubUrl.value) ||
            /^[^/]+\/[^/]+$/.test(githubUrl.value))
    )
})

async function addGithub() {
    showDlg.value = true

    const { promise, resolve } = Promise.withResolvers()
    waitAdd.value = resolve
    if (!(await promise)) {
        showDlg.value = false
        return
    }

    loading.value = true

    if (props.project) {
        await requestBindGithubProject(props.project, githubUrl.value)
    } else {
        await requestNewGithubProject(githubUrl.value)
    }

    loading.value = false
    showDlg.value = false
}

defineExpose({
    addGithub
})
</script>

<template>
    <n-modal :show="showDlg" @update:show="waitAdd(false)">
        <n-card title="添加 Github" class="max-w-2/3" role="dialog">
            <div class="flex flex-col gap-2">
                <n-input
                    placeholder="https://github.com/your/repo"
                    v-model:value="githubUrl"
                    size="small"
                    :status="githubUrlValid ? 'success' : 'error'"
                ></n-input>
            </div>

            <template #footer>
                <n-button @click="waitAdd(true)" :loading="loading" :disabled="!githubUrlValid">
                    添加
                </n-button>
            </template>
        </n-card>
    </n-modal>
</template>
