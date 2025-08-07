<script setup lang="ts" generic="Item">
import { NScrollbar } from 'naive-ui'
import { type Component, computed, onMounted, ref } from 'vue'

const props = defineProps<{
    comp: Component
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

const draggingIndex = computed(() => {
    if (dragOverTarget.value) {
        return props.items.findIndex(x => keyOf(x) === dragOverTarget.value![0])
    } else {
        return -1
    }
})

const draggingUpper = computed(() => {
    const index = draggingIndex.value
    if (index !== -1 && index > 0) {
        return keyOf(props.items[index - 1])
    } else {
        return null
    }
})

const draggingLower = computed(() => {
    const index = draggingIndex.value
    if (index !== -1 && index + 1 < props.items.length) {
        return keyOf(props.items[index + 1])
    } else {
        return null
    }
})

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

function throttle<Args extends unknown[]>(func: (...args: Args) => void, timeout = 100) {
    let timer: NodeJS.Timeout | null = null

    return (...args: Args) => {
        if (timer) {
            return
        }
        timer = setTimeout(() => {
            timer = null
        }, timeout)
        func(...args)
    }
}

const updateDragOver = throttle((sid: ItemId, divEl: HTMLDivElement, ev: DragEvent) => {
    const cr = divEl.getBoundingClientRect()
    const isUpper = ev.clientY - cr.y < cr.height / 2
    dragOverTarget.value = [sid, isUpper]
})

function dragOver(sid: ItemId, ev: DragEvent) {
    if (!dragging.value) {
        return
    }

    if (!(ev.currentTarget instanceof HTMLDivElement)) {
        console.log('dragOver: not div')
        return
    }
    const divEl = ev.currentTarget as HTMLDivElement

    ev.preventDefault()

    if (leaveTimer) {
        clearTimeout(leaveTimer)
        leaveTimer = null
    }

    updateDragOver(sid, divEl, ev)
}

let leaveTimer: NodeJS.Timeout | null = null

function dragEnter(sid: ItemId, ev: DragEvent) {
    if (!dragging.value) {
        return
    }

    if (!(ev.currentTarget instanceof HTMLDivElement)) {
        console.log('dragEnter: not div')
        return
    }
    const divEl = ev.currentTarget as HTMLDivElement

    if (dragging.value === sid) {
        return
    }

    ev.preventDefault()

    if (leaveTimer) {
        clearTimeout(leaveTimer)
        leaveTimer = null
    }

    updateDragOver(sid, divEl, ev)
}

function dragLeave(sid: ItemId, ev: DragEvent) {
    if (!dragging.value) {
        return
    }

    leaveTimer = setTimeout(() => {
        if (dragOverTarget.value?.[0] === sid) {
            dragOverTarget.value = null
        }
        leaveTimer = null
    }, 100)
}

function drop(sid: ItemId, ev: DragEvent) {
    if (!dragging.value || !dragOverTarget.value) {
        return
    }

    if (dragOverTarget.value[0] !== sid) {
        console.log('over target mismatch!')
        // ???
        return
    }

    if (dragging.value === sid) {
        return
    }

    emits('dragged', dragging.value, sid, dragOverTarget.value[1])
}

function dragEnd(sid: ItemId, ev: DragEvent) {
    dragging.value = null
}

const revealId = ref<ItemId | null>(null)
const innerContainerEl = ref<HTMLDivElement | null>(null)
const containerEl = ref<HTMLElement | null>(null)

function revealItem(sid: string) {
    if (!innerContainerEl.value || !containerEl.value) {
        return false
    }

    const index = props.items.findIndex(item => keyOf(item) === sid)
    if (index === -1) {
        return false
    }

    const targetEl = innerContainerEl.value.children[index] as HTMLDivElement
    let offset = targetEl.offsetTop + targetEl.clientHeight / 2 - containerEl.value.clientHeight / 2

    if (offset < 0) {
        offset = 0
    }
    if (offset > containerEl.value.scrollHeight - containerEl.value.clientHeight) {
        offset = containerEl.value.scrollHeight - containerEl.value.clientHeight
    }

    if (offset !== containerEl.value.scrollTop) {
        containerEl.value.scrollTo({
            top: offset,
            behavior: 'smooth'
        })
        containerEl.value.addEventListener(
            'scrollend',
            () => {
                revealId.value = sid as ItemId
                setTimeout(() => {
                    revealId.value = null
                }, 1000)
            },
            {
                once: true
            }
        )
    } else {
        revealId.value = sid as ItemId
        setTimeout(() => {
            revealId.value = null
        }, 1000)
    }
}

onMounted(() => {
    containerEl.value = innerContainerEl.value?.parentElement?.parentElement ?? null
})

defineExpose({ revealItem })
</script>

<template>
    <n-scrollbar>
        <div ref="innerContainerEl" class="flex flex-col">
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
                class="relative"
            >
                <component
                    :is="comp"
                    :id="keyOf(item)"
                    :item="item"
                    :index="index"
                    :reveal="revealId === keyOf(item)"
                    :class="{
                        'pointer-events-none': !!dragging
                    }"
                >
                    <template #anchor>
                        <div
                            @dragstart="e => dragStart(keyOf(item), e)"
                            @dragend="e => dragEnd(keyOf(item), e)"
                            :draggable="true"
                            class="pointer-events-auto"
                        >
                            <slot name="anchor" v-bind="{ item, index }"></slot>
                        </div>
                    </template>
                </component>
                <div
                    class="draggable-layer top-0"
                    :style="{
                        opacity:
                            dragging &&
                            dragOverTarget &&
                            ((dragOverTarget[1] && dragOverTarget[0] === keyOf(item)) ||
                                (!dragOverTarget[1] && draggingLower === keyOf(item)))
                                ? '30%'
                                : '0'
                    }"
                ></div>
                <div
                    class="draggable-layer bottom-0"
                    :style="{
                        opacity:
                            dragging &&
                            dragOverTarget &&
                            ((!dragOverTarget[1] && dragOverTarget[0] === keyOf(item)) ||
                                (dragOverTarget[1] && draggingUpper === keyOf(item)))
                                ? '30%'
                                : '0'
                    }"
                ></div>
            </div>
        </div>
    </n-scrollbar>
</template>

<style scoped>
@reference "../base.css";

.draggable-layer {
    @apply absolute left-0 right-0 h-1/2 bg-slate-500 pointer-events-none transition-opacity;
}
</style>
