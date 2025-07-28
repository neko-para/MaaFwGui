<script setup lang="ts">
import { useRouter } from 'vue-router'

import MIconButton from '@/components/MIconButton.vue'
import { AddOutlined, CloseOutlined, SettingsOutlined } from '@/icons'
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
            <m-icon-button
                @action="
                    router.push({
                        path: '/settings'
                    })
                "
            >
                <settings-outlined></settings-outlined>
            </m-icon-button>
            <m-icon-button :action="requestNewProfile" use-loading>
                <add-outlined></add-outlined>
            </m-icon-button>
        </template>

        <template #itemEntry="{ item: profile }">
            <span class="text-xl">
                {{
                    (profile.name === '' ? '<未命名方案>' : profile.name) +
                    (profile.id === profileId ? ' *' : '')
                }}
            </span>
        </template>

        <template #itemActions="{ item: profile }">
            <m-icon-button @action="requestDelProfile(profile.id)">
                <close-outlined></close-outlined>
            </m-icon-button>
        </template>
    </l-generic-side>
</template>
