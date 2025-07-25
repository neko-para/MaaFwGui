<script setup lang="ts">
import { useRouter } from 'vue-router'

import MEntry from '@/components/MEntry.vue'
import MNavBackButton from '@/components/buttons/MNavBackButton.vue'
import { useProfile } from '@/states/profile'

const router = useRouter()

const { profileId, stageId, activeProfileInfo } = useProfile()
</script>

<template>
    <div class="m-4 flex flex-col gap-2">
        <div class="flex gap-2">
            <span class="text-xl"> 步骤列表 </span>
            <div class="flex-1"></div>
            <m-nav-back-button></m-nav-back-button>
        </div>
        <m-entry
            v-for="stage in activeProfileInfo?.stages"
            :key="stage.id"
            @click="
                router.replace({
                    path: `/profile/${profileId}/stage/${stage.id}`
                })
            "
        >
            <span class="text-xl">
                {{ stage.name + (stage.id === stageId ? ' *' : '') }}
            </span>
        </m-entry>
    </div>
</template>
