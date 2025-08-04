<script setup lang="ts">
import { marked } from 'marked'
import { NButton, NCard, NModal, NScrollbar } from 'naive-ui'
import { onMounted, onUnmounted, ref } from 'vue'

const showDlg = ref(false)
const waitInstall = ref<(v: boolean) => void>(() => {})

const releaseVer = ref('')
const releaseNotes = ref('')

const unbind = ref(() => {})

onMounted(() => {
    unbind.value = window.renderer.project.updateFound(async (version, notes) => {
        releaseVer.value = version
        releaseNotes.value = await marked(notes)

        showDlg.value = true

        const { promise, resolve } = Promise.withResolvers<boolean>()
        waitInstall.value = resolve
        const res = await promise
        showDlg.value = false
        return res
    })
})

onUnmounted(() => {
    unbind.value()
})
</script>

<template>
    <n-modal :show="showDlg" @update:show="waitInstall(false)">
        <n-card :title="`发现新版本 ${releaseVer}`" class="max-w-2/3" role="dialog">
            <n-scrollbar class="flex flex-col" style="max-height: 60vh">
                <div class="markdown-body min-h-0" v-html="releaseNotes"></div>
            </n-scrollbar>

            <template #footer>
                <n-button @click="waitInstall(true)"> 更新 </n-button>
            </template>
        </n-card>
    </n-modal>
</template>
