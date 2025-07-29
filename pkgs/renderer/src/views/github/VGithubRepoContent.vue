<script setup lang="ts">
import { NPopselect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import { requestCheckRepoUpdate, requestExportRepo, useGithubRepo } from '@/states/github'

const router = useRouter()

const { githubRepoId, activeGithubRepoInfo } = useGithubRepo()

const checkoutProcessing = ref(false)

async function checkoutVersion(ver: string) {
    checkoutProcessing.value = true
    await requestExportRepo(githubRepoId.value!, ver)
    checkoutProcessing.value = false
}
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <span class="text-xl"> 基础信息 </span>
        </div>

        <div v-if="githubRepoId && activeGithubRepoInfo" class="form-grid items-center gap-2">
            <span> 名称 </span>
            <span> {{ activeGithubRepoInfo.name }} </span>
            <span> 地址 </span>
            <span> {{ activeGithubRepoInfo.url }} </span>
            <template v-if="activeGithubRepoInfo.expose">
                <span> 当前版本 </span>
                <div class="flex items-center gap-2">
                    <span> {{ activeGithubRepoInfo.expose.version }} </span>
                    <m-button
                        @click="
                            () => {
                                router.back()
                                nextTick(() => {
                                    router.replace({
                                        path: `/project/${activeGithubRepoInfo!.expose!.project}`
                                    })
                                })
                            }
                        "
                    >
                        查看
                    </m-button>
                </div>
            </template>
            <template v-if="activeGithubRepoInfo.meta">
                <span> 最新版本 </span>
                <span> {{ activeGithubRepoInfo.meta.latest }} </span>
            </template>
            <span></span>
            <div class="flex items-center gap-2">
                <m-button :action="async () => requestCheckRepoUpdate(githubRepoId!)" use-loading>
                    检查更新
                </m-button>
                <m-button
                    v-if="!activeGithubRepoInfo.expose && activeGithubRepoInfo.meta"
                    :action="
                        async () =>
                            requestExportRepo(githubRepoId!, activeGithubRepoInfo!.meta!.latest)
                    "
                    use-loading
                >
                    导出项目
                </m-button>
                <n-popselect
                    v-if="activeGithubRepoInfo.meta"
                    trigger="hover"
                    :options="
                        activeGithubRepoInfo.meta.versions.map(ver => {
                            const isCurr = ver === activeGithubRepoInfo!.expose?.version
                            const isLatest = ver === activeGithubRepoInfo!.meta!.latest
                            return {
                                value: ver,
                                label: ver + (isCurr ? ' 当前' : '') + (isLatest ? ' 最新' : ''),
                                disabled: isCurr
                            } satisfies SelectMixedOption
                        })
                    "
                    @update:value="checkoutVersion"
                    scrollable
                >
                    <m-button
                        @action="checkoutVersion(activeGithubRepoInfo.meta.latest)"
                        :loading="checkoutProcessing"
                    >
                        导出指定版本
                    </m-button>
                </n-popselect>
            </div>
        </div>
    </div>
</template>
