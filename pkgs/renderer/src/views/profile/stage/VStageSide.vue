<script setup lang="ts">
import { useRouter } from 'vue-router'

import LGenericSide from '@/layouts/LGenericSide.vue'
import { useProfile } from '@/states/profile'

const router = useRouter()

const { profileId, stageId, activeProfileInfo } = useProfile()
</script>

<template>
    <l-generic-side
        title="步骤列表"
        :items="activeProfileInfo?.stages.filter(stage => stage.project) ?? []"
        key-prop="id"
        @click="
            stage => {
                router.replace({
                    path: `/profile/${profileId}/stage/${stage.id}`
                })
            }
        "
    >
        <template #itemEntry="{ item: stage }">
            <span class="text-xl">
                {{
                    (stage.name === '' ? '<未命名步骤>' : stage.name) +
                    (stage.id === stageId ? ' *' : '')
                }}
            </span>
        </template>
    </l-generic-side>
</template>
