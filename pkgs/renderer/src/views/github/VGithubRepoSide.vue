<script setup lang="ts">
import { NButton, NCard, NInput, NModal } from 'naive-ui'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import LGenericSide from '@/layouts/LGenericSide.vue'
import { githubRepoInfo, requestDelRepo, requestNewRepo, useGithubRepo } from '@/states/github'

const router = useRouter()

const { githubRepoId } = useGithubRepo()

const showDlg = ref(false)
const waitDlg = ref<(v: boolean) => void>(() => {})
const githubUrl = ref('')
const githubUrlValid = computed(() => {
    return (
        githubUrl.value && /^https?:\/\/github.com\/[^/]+\/[^/]+(?:.git|\/)?$/.test(githubUrl.value)
    )
})

async function newProject() {
    showDlg.value = true
    if (
        !(await new Promise<boolean>(resolve => {
            waitDlg.value = resolve
        }))
    ) {
        showDlg.value = false
        return
    }
    await requestNewRepo(githubUrl.value)
    showDlg.value = false
}
</script>

<template>
    <n-modal :show="showDlg" @update:show="() => waitDlg(false)">
        <n-card title="添加 Github 项目" class="max-w-2/3" role="dialog">
            <div class="flex flex-col gap-2">
                <n-input
                    placeholder="https://github.com/your/repo"
                    v-model:value="githubUrl"
                    size="small"
                    :status="githubUrlValid ? 'success' : 'error'"
                ></n-input>
            </div>

            <template #footer>
                <n-button @click="waitDlg(true)"> 添加 </n-button>
            </template>
        </n-card>
    </n-modal>

    <l-generic-side
        title="Github项目列表"
        :items="githubRepoInfo"
        key-prop="id"
        @click="
            repo => {
                router.replace({
                    path: `/github-repo/${repo.id}`
                })
            }
        "
    >
        <template #actions>
            <m-button :action="newProject" use-loading> 导入 </m-button>
        </template>

        <template #itemEntry="{ item: repo }">
            <span class="text-lg"> {{ repo.name + (repo.id === githubRepoId ? ' *' : '') }} </span>
        </template>

        <template #itemActions="{ item: repo }">
            <m-button :action="async () => requestDelRepo(repo.id)" use-loading> 删除 </m-button>
        </template>
    </l-generic-side>
</template>
