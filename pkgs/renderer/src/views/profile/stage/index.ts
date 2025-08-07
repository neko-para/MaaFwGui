import type { TaskId } from '@mfg/types'
import { ref } from 'vue'

import VStageContent from './VStageContent.vue'
import VStageSide from './VStageSide.vue'

export const Stage = {
    side: VStageSide,
    content: VStageContent
}

export const StageRevealTask = ref<(task: TaskId) => void>(() => {})
