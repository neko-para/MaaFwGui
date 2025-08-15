<script setup lang="ts">
import type { MaaLoaderOption, MaaLoaderRegistry } from '@mfg/maa'
import { NInput, NPopselect } from 'naive-ui'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import semVerCompare from 'semver/functions/compare'
import { computed, onMounted, ref } from 'vue'

import MButton from '@/components/MButton.vue'
import { config, syncConfig } from '@/states/config'
import { maaVersion } from '@/states/maa'

const allFwVers = ref<{ version: string; downloaded: boolean }[]>([])
const fwLoaderOption = ref<MaaLoaderOption | null>(null)
const fwVersOptions = computed(() => {
    return allFwVers.value.map(ver => {
        let label = ver.version
        if (ver.downloaded) {
            label += ' 已下载'
        }
        return {
            value: ver.version,
            label
        } satisfies SelectMixedOption
    })
})
const fwRegsOptions = computed(() => {
    return ['cnpm', 'npm'].map(reg => {
        return {
            value: reg,
            label: reg
        } satisfies SelectMixedOption
    })
})

async function selectFwVer(ver: string) {
    await window.main.maa.setVersion(ver)
    fwLoaderOption.value = await window.main.maa.query()
}

async function selectFwReg(reg: MaaLoaderRegistry) {
    await window.main.maa.setRegistry(reg)
    fwLoaderOption.value = await window.main.maa.query()
    await syncFwVersions()
}

async function syncFwVersions() {
    allFwVers.value = (await window.main.maa.allVersion()).sort((a, b) => {
        return -semVerCompare(a.version, b.version)
    })
}

const guiVer = ref('')

const fakeToken = '********'

const githubToken = ref('')
const isValidGithubToken = computed(() => {
    return githubToken.value.startsWith('github_pat_')
})

async function cleanGithubToken() {
    await window.main.github.cleanToken()
    githubToken.value = ''
    await syncConfig()
}

async function validateGithubToken() {
    if (!githubToken.value.startsWith('github_pat_')) {
        githubToken.value = ''
        return
    }

    if (await window.main.github.tryUpdateToken(githubToken.value)) {
        githubToken.value = fakeToken
        await syncConfig()
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

async function toggleDebugMode() {
    await window.main.misc.toggleDebugMode()
    await syncConfig()
}

async function revealData() {
    await window.main.misc.revealData()
}

async function openDevTools() {
    await window.main.misc.openDevTools()
}

onMounted(async () => {
    fwLoaderOption.value = await window.main.maa.query()
    guiVer.value = await window.main.misc.MaaFwGuiVersion()
    await syncConfig()

    if (await window.main.github.hasToken()) {
        githubToken.value = fakeToken
    }
    if (await window.main.mirrorc.hasToken()) {
        mirrorcToken.value = fakeToken
    }

    await syncFwVersions()
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
            <div class="flex items-center justify-start gap-2">
                <span> {{ maaVersion ?? '未加载' }} </span>
                <template v-if="fwLoaderOption">
                    <span v-if="!maaVersion"> 正在安装 {{ fwLoaderOption.version }} </span>
                    <template v-else>
                        <n-popselect
                            :options="fwVersOptions"
                            @update:value="selectFwVer"
                            scrollable
                        >
                            <m-button> 安装其它版本 </m-button>
                        </n-popselect>
                        <span v-if="fwLoaderOption.version !== maaVersion">
                            重启后使用 {{ fwLoaderOption.version }}
                        </span>
                        <n-popselect :options="fwRegsOptions" @update:value="selectFwReg">
                            <m-button> 下载源 {{ fwLoaderOption.registry }} </m-button>
                        </n-popselect>
                    </template>
                </template>
            </div>
            <span> MaaFrameworkGui </span>
            <span> {{ guiVer }} </span>
        </div>

        <div class="flex gap-2">
            <span class="text-xl"> 调试 </span>
        </div>

        <div class="flex items-center gap-2">
            <m-button :action="toggleDebugMode" use-loading>
                {{ config.debugMode ? '禁用调试模式' : '启用调试模式' }}
            </m-button>
            <template v-if="config.debugMode">
                <m-button :action="revealData" use-loading> 查看数据 </m-button>
                <m-button :action="openDevTools" use-loading> 打开DevTools </m-button>
            </template>
        </div>
    </div>
</template>
