<script setup lang="ts">
import type { GlobalConfig } from '@mfg/types'
import { NInput } from 'naive-ui'
import { onMounted, ref } from 'vue'

import MButton from '@/components/MButton.vue'

const fwVer = ref('')
const guiVer = ref('')

const config = ref<GlobalConfig>({})

const githubToken = ref('')

async function validateToken() {
    githubToken.value = githubToken.value.trim()
    if (!githubToken.value.startsWith('github_pat_')) {
        return
    }

    await window.main.github.tryUpdateToken(githubToken.value)
    config.value = await window.main.utils.queryConfig()
}

async function revealData() {
    await window.main.misc.revealData()
}

onMounted(async () => {
    fwVer.value = await window.main.misc.MaaFwVersion()
    guiVer.value = await window.main.misc.MaaFwGuiVersion()
    config.value = await window.main.utils.queryConfig()

    githubToken.value = config.value.githubAuthToken ?? ''
})
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex gap-2">
            <span class="text-xl"> Github </span>
        </div>
        <div class="form-grid items-center gap-2">
            <span> Token </span>
            <div class="flex items-center gap-2">
                <n-input
                    placeholder="github_pat_"
                    type="password"
                    v-model:value="githubToken"
                    size="small"
                ></n-input>
                <m-button :action="validateToken" use-loading> 校验 </m-button>
            </div>
            <template v-if="config.githubLoginUser">
                <span></span>
                <span> 已登录为 {{ config.githubLoginUser }} </span>
            </template>
        </div>

        <div class="flex gap-2">
            <span class="text-xl"> 关于 </span>
        </div>
        <div class="form-grid items-center gap-2">
            <span> MaaFramework </span>
            <span> {{ fwVer }} </span>
            <span> MaaFrameworkGui </span>
            <span> {{ guiVer }} </span>
        </div>

        <div class="flex gap-2">
            <span class="text-xl"> 调试 </span>
        </div>

        <div class="flex items-center gap-2">
            <m-button :action="revealData" use-loading> 查看数据 </m-button>
        </div>
    </div>
</template>
