<script setup lang="ts">
import { useRouter } from 'vue-router'

import MButton from '@/components/MButton.vue'
import LGenericSide from '@/layouts/LGenericSide.vue'
import { profileInfo, requestDelProfile, requestNewProfile, useProfile } from '@/states/profile'

const router = useRouter()
const { profileId } = useProfile()
</script>

<template>
    <l-generic-side
        title="方案列表"
        :items="profileInfo"
        key-prop="id"
        :show-back="false"
        @click="
            profile => {
                router.replace({
                    path: `/profile/${profile.id}`
                })
            }
        "
    >
        <template #actions>
            <m-button
                @action="
                    router.push({
                        path: '/settings'
                    })
                "
            >
                设置
            </m-button>
            <m-button :action="requestNewProfile" use-loading> 新建 </m-button>
        </template>

        <template #itemEntry="{ item: profile }">
            <span
                :class="`text-base ${profile.id === profileId ? 'font-bold text-[#36ad6a]' : ''}`"
            >
                {{ profile.name === '' ? '<未命名方案>' : profile.name }}
            </span>
        </template>

        <template #itemActions="{ item: profile }">
            <m-button :action="() => requestDelProfile(profile.id)" use-loading> 删除 </m-button>
        </template>
    </l-generic-side>
</template>
