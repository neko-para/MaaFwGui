<script setup lang="ts" generic="Item">
import { NScrollbar } from 'naive-ui'
import { type Component, ref } from 'vue'

const props = defineProps<{
    component: Component
    items: Item[]
    keyProp: keyof Item
    halfGap: string
    getReal: (anchor: HTMLDivElement) => HTMLElement | null | undefined
}>()

const emits = defineEmits<{
    dragged: [from: string, to: string, before: boolean]
}>()

type ItemId = string & { __brand: 'ItemId' }

function keyOf(item: Item) {
    return item[props.keyProp] as ItemId
}

const dragging = ref<ItemId | null>(null)
const dragOverTarget = ref<[sid: ItemId, upper: boolean] | null>(null)

function dragStart(sid: ItemId, ev: DragEvent) {
    if (!(ev.currentTarget instanceof HTMLDivElement)) {
        ev.preventDefault()
        return
    }
    const divEl = ev.currentTarget as HTMLDivElement

    const targetEl = props.getReal(divEl)
    if (!targetEl) {
        ev.preventDefault()
        return
    }

    let offsetX = ev.offsetX
    let offsetY = ev.offsetY
    let offsetEl: HTMLElement = divEl
    while (offsetEl !== targetEl) {
        const parent: Element | null = offsetEl.offsetParent
        if (!parent || !(parent instanceof HTMLElement)) {
            ev.preventDefault()
            return
        }
        offsetX += offsetEl.offsetLeft
        offsetY += offsetEl.offsetTop
        offsetEl = parent
    }

    if (!ev.dataTransfer) {
        ev.preventDefault()
        return
    }

    ev.dataTransfer.effectAllowed = 'move'
    ev.dataTransfer.setDragImage(targetEl, offsetX, offsetY)

    dragging.value = sid
}

function dragOver(sid: ItemId, ev: DragEvent) {
    if (!dragging.value) {
        return
    }

    if (!(ev.currentTarget instanceof HTMLDivElement)) {
        return
    }
    const divEl = ev.currentTarget as HTMLDivElement

    if (dragging.value === sid) {
        return
    }

    ev.preventDefault()
    const cr = divEl.getBoundingClientRect()
    const isUpper = ev.clientY - cr.y < cr.height / 2
    dragOverTarget.value = [sid, isUpper]
}

function dragEnter(sid: ItemId, ev: DragEvent) {
    if (!dragging.value) {
        return
    }

    if (!(ev.currentTarget instanceof HTMLDivElement)) {
        return
    }
    const divEl = ev.currentTarget as HTMLDivElement

    if (dragging.value === sid) {
        return
    }

    ev.preventDefault()
    const cr = divEl.getBoundingClientRect()
    const isUpper = ev.clientY - cr.y < cr.height / 2
    dragOverTarget.value = [sid, isUpper]
}

function dragLeave(sid: ItemId, ev: DragEvent) {
    if (!dragging.value) {
        return
    }

    if (dragOverTarget.value?.[0] === sid) {
        dragOverTarget.value = null
    }
}

function drop(sid: ItemId, ev: DragEvent) {
    if (!dragging.value || !dragOverTarget.value) {
        return
    }

    if (dragOverTarget.value[0] !== sid) {
        // ???
        return
    }

    emits('dragged', dragging.value, sid, dragOverTarget.value[1])
}

function dragEnd(sid: ItemId, ev: DragEvent) {
    dragging.value = null
}
</script>

<template>
    <n-scrollbar>
        <div class="flex flex-col">
            <div
                v-for="(item, index) in items"
                :key="keyOf(item)"
                @dragover="e => dragOver(keyOf(item), e)"
                @dragenter="e => dragEnter(keyOf(item), e)"
                @dragleave="e => dragLeave(keyOf(item), e)"
                @drop="e => drop(keyOf(item), e)"
                :style="{
                    paddingTop: index === 0 ? undefined : halfGap,
                    paddingBottom: index === items.length - 1 ? undefined : halfGap
                }"
            >
                <component :id="keyOf(item)" :item="item" :index="index">
                    <template #anchor>
                        <div
                            @dragstart="e => dragStart(keyOf(item), e)"
                            @dragend="e => dragEnd(keyOf(item), e)"
                            :draggable="true"
                        >
                            <slot name="anchor" v-bind="{ item, index }"></slot>
                        </div>
                    </template>
                </component>
            </div>
        </div>
    </n-scrollbar>
</template>
