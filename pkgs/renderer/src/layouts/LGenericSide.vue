<script setup lang="ts" generic="Item">
import { NScrollbar } from 'naive-ui'

import MEntry from '@/components/MEntry.vue'
import MNavBackButton from '@/components/buttons/MNavBackButton.vue'

const props = withDefaults(
    defineProps<{
        title: string
        items: Item[]
        keyProp: keyof Item
        showBack?: boolean
    }>(),
    {
        showBack: true
    }
)

const emits = defineEmits<{
    click: [Item]
}>()

function itemKey(item: Item) {
    return item[props.keyProp] as string
}
</script>

<template>
    <div class="m-4 flex flex-col gap-2 flex-1 min-h-0">
        <div class="flex gap-2">
            <span class="text-xl"> {{ title }} </span>
            <div class="flex-1"></div>
            <m-nav-back-button v-if="showBack"></m-nav-back-button>
            <slot name="actions"></slot>
        </div>
        <n-scrollbar>
            <div class="flex flex-col gap-2">
                <div v-for="item in items" :key="itemKey(item)" class="flex items-center gap-2">
                    <m-entry @click="emits('click', item)">
                        <slot name="itemEntry" :item="item"></slot>
                    </m-entry>
                    <div class="flex-1"></div>
                    <slot name="itemActions" :item="item"></slot>
                </div>
            </div>
        </n-scrollbar>
        <slot name="bottom"></slot>
    </div>
</template>
