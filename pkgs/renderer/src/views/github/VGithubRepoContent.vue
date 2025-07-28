<script setup lang="ts">
import MButton from '@/components/MButton.vue'
import { requestCheckRepoUpdate, useGithubRepo } from '@/states/github'

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
            <template v-if="activeGithubRepoInfo.update">
                <span> 最新版本 </span>
                <span> {{ activeGithubRepoInfo.update?.version }} </span>
            </template>
            <span></span>
            <div class="flex items-center gap-2">
                <m-button :action="async () => requestCheckRepoUpdate(githubRepoId!)" use-loading>
                    检查更新
                </m-button>
            </div>
        </div>
    </div>
</template>
