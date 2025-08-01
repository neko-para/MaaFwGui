<script setup lang="ts">
import { nextTick } from 'vue'
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import { requestCheckAppUpdate, requestExportApp, useMirrorcApp } from '@/states/mirrorc'

const router = useRouter()

const { mirrorcAppId, activeMirrorcAppInfo } = useMirrorcApp()
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
            <template v-if="activeMirrorcAppInfo.meta?.latestDone">
                <span> 已下载版本 </span>
                <div class="flex items-center gap-2">
                    <span> {{ activeMirrorcAppInfo.meta?.latestDone }} </span>
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
                <template v-if="activeMirrorcAppInfo.meta">
                    <template v-if="activeMirrorcAppInfo.expose">
                        <m-button
                            :action="async () => requestExportApp(mirrorcAppId!)"
                            use-loading
                            :disabled="
                                activeMirrorcAppInfo.meta.latest ===
                                activeMirrorcAppInfo.expose.version
                            "
                        >
                            更新项目
                        </m-button>
                    </template>
                    <template v-else>
                        <m-button
                            v-if="activeMirrorcAppInfo.meta"
                            :action="async () => requestExportApp(mirrorcAppId!)"
                            use-loading
                        >
                            导出项目
                        </m-button>
                    </template>
                </template>
            </div>
        </div>
    </div>
</template>
