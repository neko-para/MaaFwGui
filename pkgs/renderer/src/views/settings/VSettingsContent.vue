<script setup lang="ts">
import type { GlobalConfig } from '@mfg/types'
import { NInput } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'

import MButton from '@/components/MButton.vue'

const fwVer = ref('')
const guiVer = ref('')

const fakeToken = '********'

const config = ref<GlobalConfig>({})

const githubToken = ref('')
const isValidGithubToken = computed(() => {
    return githubToken.value.startsWith('github_pat_')
})

async function cleanGithubToken() {
    await window.main.github.cleanToken()
    githubToken.value = ''
    config.value = await window.main.utils.queryConfig()
}

async function validateGithubToken() {
    if (!githubToken.value.startsWith('github_pat_')) {
        githubToken.value = ''
        return
    }

    if (await window.main.github.tryUpdateToken(githubToken.value)) {
        githubToken.value = fakeToken
        config.value = await window.main.utils.queryConfig()
    } else {
        githubToken.value = ''
    }
}

const mirrorcToken = ref('')
const isValidMirrorcToken = computed(() => {
    return /^[0-9a-f]{24}$/.test(mirrorcToken.value)
})

async function cleanMirrorcToken() {
    await window.main.mirrorc.cleanToken()
    mirrorcToken.value = ''
}

async function validateMirrorcToken() {
    mirrorcToken.value = mirrorcToken.value.trim()

    if (await window.main.mirrorc.tryUpdateToken(mirrorcToken.value)) {
        mirrorcToken.value = fakeToken
    } else {
        mirrorcToken.value = ''
    }
}

async function revealData() {
    await window.main.misc.revealData()
}

onMounted(async () => {
    fwVer.value = await window.main.misc.MaaFwVersion()
    guiVer.value = await window.main.misc.MaaFwGuiVersion()
    config.value = await window.main.utils.queryConfig()

    if (await window.main.github.hasToken()) {
        githubToken.value = fakeToken
    }
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
                <m-button v-if="githubToken" :action="cleanGithubToken" use-loading>
                    清除
                </m-button>
                <m-button :action="validateGithubToken" use-loading :disabled="!isValidGithubToken">
                    校验
                </m-button>
            </div>
            <template v-if="config.githubLoginUser">
                <span></span>
                <span> 已登录为 {{ config.githubLoginUser }} </span>
            </template>
        </div>

        <div class="flex gap-2">
            <span class="text-xl"> MirrorChyan </span>
        </div>
        <div class="form-grid items-center gap-2">
            <span> Token </span>
            <div class="flex items-center gap-2">
                <n-input
                    placeholder="mirrorchyan cdk"
                    type="password"
                    v-model:value="mirrorcToken"
                    size="small"
                ></n-input>
                <m-button v-if="mirrorcToken" :action="cleanMirrorcToken" use-loading>
                    清除
                </m-button>
                <m-button
                    :action="validateMirrorcToken"
                    use-loading
                    :disabled="!isValidMirrorcToken"
                >
                    校验
                </m-button>
            </div>
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
