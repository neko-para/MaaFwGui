<script setup lang="ts">
import { nextTick } from 'vue'
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import { requestCheckRepoUpdate, requestExportRepo, useGithubRepo } from '@/states/github'

const router = useRouter()

const { githubRepoId, activeGithubRepoInfo } = useGithubRepo()
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
            <template v-if="activeGithubRepoInfo.update">
                <span> 最新版本 </span>
                <span> {{ activeGithubRepoInfo.update?.version }} </span>
            </template>
            <span></span>
            <div class="flex items-center gap-2">
                <m-button :action="async () => requestCheckRepoUpdate(githubRepoId!)" use-loading>
                    检查更新
                </m-button>
                <m-button
                    v-if="!activeGithubRepoInfo.expose && activeGithubRepoInfo.update"
                    :action="async () => requestExportRepo(githubRepoId!)"
                    use-loading
                >
                    导出项目
                </m-button>
            </div>
        </div>
    </div>
</template>
