<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import MEntry from '@/components/MEntry.vue'
import MIconButton from '@/components/MIconButton.vue'
import { MoreHorizOutlined } from '@/icons'
import { profileInfo, useProfile } from '@/states/profile'

const router = useRouter()
const { profileId, activeProfileInfo } = useProfile()

onMounted(() => {
    if (!activeProfileInfo.value) {
        router.replace({
            path: '/profile'
        })
    }
})
</script>

<template>
    <div v-if="activeProfileInfo" class="m-4 flex flex-col gap-2">
        <div class="flex gap-2">
            <span class="text-xl"> 当前方案 </span>
            <div class="flex-1"></div>
            <m-icon-button
                @action="
                    router.replace({
                        path: '/profile'
                    })
                "
            >
                <more-horiz-outlined></more-horiz-outlined>
            </m-icon-button>
        </div>
        <m-entry>
            <span class="text-lg">
                {{ activeProfileInfo.name === '' ? '<未命名方案>' : activeProfileInfo.name }}
            </span>
        </m-entry>
        <div class="flex gap-2 justify-between">
            <span class="text-xl"> 其它方案 </span>
        </div>
        <template v-for="profile in profileInfo" :key="profile.id">
            <m-entry
                v-if="profile.id !== profileId"
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
        </template>
    </div>
</template>
