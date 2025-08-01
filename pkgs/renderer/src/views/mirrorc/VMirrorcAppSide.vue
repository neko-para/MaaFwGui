<script setup lang="ts">
import { NButton, NCard, NInput, NModal } from 'naive-ui'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import LGenericSide from '@/layouts/LGenericSide.vue'
import { mirrorcAppInfo, requestDelApp, requestNewApp, useMirrorcApp } from '@/states/mirrorc'

const router = useRouter()

const { mirrorcAppId } = useMirrorcApp()

const showDlg = ref(false)
const waitDlg = ref<(v: boolean) => void>(() => {})
const mirrorcRid = ref('')
const mirrorcRidValid = computed(() => {
    return mirrorcRid.value.length > 0
})

async function newProject() {
    showDlg.value = true
    if (
        !(await new Promise<boolean>(resolve => {
            waitDlg.value = resolve
        }))
    ) {
        showDlg.value = false
        return
    }
    await requestNewApp(mirrorcRid.value)
    showDlg.value = false
}
</script>

<template>
    <n-modal :show="showDlg" @update:show="() => waitDlg(false)">
        <n-card title="添加 Mirrorc 应用" class="max-w-2/3" role="dialog">
            <div class="flex flex-col gap-2">
                <n-input
                    placeholder="app rid"
                    v-model:value="mirrorcRid"
                    size="small"
                    :status="mirrorcRidValid ? 'success' : 'error'"
                ></n-input>
            </div>

            <template #footer>
                <n-button @click="waitDlg(true)"> 添加 </n-button>
            </template>
        </n-card>
    </n-modal>

    <l-generic-side
        title="Mirrorc应用列表"
        :items="mirrorcAppInfo"
        key-prop="id"
        @click="
            app => {
                router.replace({
                    path: `/mirrorc-app/${app.id}`
                })
            }
        "
    >
        <template #actions>
            <m-button :action="newProject" use-loading> 导入 </m-button>
        </template>

        <template #itemEntry="{ item: app }">
            <span class="text-lg"> {{ app.name + (app.id === mirrorcAppId ? ' *' : '') }} </span>
        </template>

        <template #itemActions="{ item: app }">
            <m-button :action="async () => requestDelApp(app.id)" use-loading> 删除 </m-button>
        </template>
    </l-generic-side>
</template>
