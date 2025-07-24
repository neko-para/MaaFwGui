<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import MEntry from '@/components/MEntry.vue'
import MIconButton from '@/components/MIconButton.vue'
import { AddOutlined } from '@/icons'
import { profileInfo, requestNewProfile, syncProfile } from '@/states/profile'

const router = useRouter()

onMounted(async () => {
    syncProfile()
})
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex gap-2">
            <span class="text-xl font-bold"> 方案列表 </span>
            <div class="flex-1"></div>
            <m-icon-button :action="requestNewProfile" use-loading>
                <add-outlined></add-outlined>
            </m-icon-button>
        </div>
        <m-entry
            v-for="profile in profileInfo"
            :key="profile.id"
            @click="
                router.replace({
                    path: `/profile/${profile.id}`
                })
            "
        >
            <span class="text-lg">
                {{ profile.name === '' ? '<未命名方案>' : profile.name }}
            </span>
        </m-entry>
    </div>
</template>
