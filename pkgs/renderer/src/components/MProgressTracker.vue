<script setup lang="tsx">
import { type NotificationReactive, useNotification } from 'naive-ui'
import { onMounted, onUnmounted, reactive, ref } from 'vue'

const notification = useNotification()

const progressInfo = reactive<
    Record<
        string,
        {
            noti?: NotificationReactive
            stage?: string
            progress?: number
        }
    >
>({})

const unbind1 = ref(() => {})
const unbind2 = ref(() => {})

onMounted(() => {
    unbind1.value = window.renderer.utils.showProgress((id, stage, progress) => {
        progressInfo[id] = progressInfo[id] ?? {}
        progressInfo[id].stage = stage
        progressInfo[id].progress = progress

        if (!progressInfo[id].noti) {
            progressInfo[id].noti = notification.create({
                closable: false,
                content: () => {
                    return (
                        <>
                            <div class="flex gap-2">
                                <span> {progressInfo[id].stage} </span>
                                {progressInfo[id].progress !== undefined ? (
                                    <span> {progressInfo[id].progress.toFixed(2)}% </span>
                                ) : (
                                    <></>
                                )}
                            </div>
                        </>
                    )
                }
            })
        }
    })
    unbind2.value = window.renderer.utils.endProgress(id => {
        progressInfo[id]?.noti?.destroy()
        delete progressInfo[id]
    })
})

onUnmounted(() => {
    unbind1.value()
    unbind2.value()
})
</script>

<template></template>
