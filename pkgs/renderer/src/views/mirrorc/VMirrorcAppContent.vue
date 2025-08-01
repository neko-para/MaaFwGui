<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import { requestCheckAppUpdate, requestExportApp, useMirrorcApp } from '@/states/mirrorc'

const router = useRouter()

const { mirrorcAppId, activeMirrorcAppInfo } = useMirrorcApp()

const checkoutProcessing = ref(false)

async function checkoutVersion(ver: string) {
    checkoutProcessing.value = true
    await requestExportApp(mirrorcAppId.value!, ver)
    checkoutProcessing.value = false
}
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex items-center gap-2">
            <span class="text-xl"> 基础信息 </span>
        </div>

        <div v-if="mirrorcAppId && activeMirrorcAppInfo" class="form-grid items-center gap-2">
            <span> 名称 </span>
            <span> {{ activeMirrorcAppInfo.name }} </span>
            <span> RID </span>
            <span> {{ activeMirrorcAppInfo.rid }} </span>
            <template v-if="activeMirrorcAppInfo.expose">
                <span> 当前版本 </span>
                <div class="flex items-center gap-2">
                    <span> {{ activeMirrorcAppInfo.expose.version }} </span>
                    <m-button
                        @click="
                            () => {
                                router.back()
                                nextTick(() => {
                                    router.replace({
                                        path: `/project/${activeMirrorcAppInfo!.expose!.project}`
                                    })
                                })
                            }
                        "
                    >
                        查看
                    </m-button>
                </div>
            </template>
            <template v-if="activeMirrorcAppInfo.meta">
                <span> 最新版本 </span>
                <span> {{ activeMirrorcAppInfo.meta.latest }} </span>
            </template>
            <span></span>
            <div class="flex items-center gap-2">
                <m-button :action="async () => requestCheckAppUpdate(mirrorcAppId!)" use-loading>
                    检查更新
                </m-button>
                <m-button
                    v-if="!activeMirrorcAppInfo.expose && activeMirrorcAppInfo.meta"
                    :action="
                        async () =>
                            requestExportApp(mirrorcAppId!, activeMirrorcAppInfo!.meta!.latest)
                    "
                    use-loading
                >
                    导出项目
                </m-button>
                <!-- <n-popselect
                    v-if="activeMirrorcAppInfo.meta"
                    trigger="hover"
                    :options="
                        activeMirrorcAppInfo.meta.versions.map(ver => {
                            const isCurr = ver === activeMirrorcAppInfo!.expose?.version
                            const isLatest = ver === activeMirrorcAppInfo!.meta!.latest
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
                        @action="checkoutVersion(activeMirrorcAppInfo.meta.latest)"
                        :loading="checkoutProcessing"
                    >
                        导出指定版本
                    </m-button>
                </n-popselect> -->
            </div>
        </div>
    </div>
</template>
