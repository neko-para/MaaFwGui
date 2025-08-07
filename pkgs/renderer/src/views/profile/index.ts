import type { StageId } from '@mfg/types'
import { ref } from 'vue'

import VProfileContent from './VProfileContent.vue'
import VProfileSide from './VProfileSide.vue'

export const Profile = {
    side: VProfileSide,
    content: VProfileContent
}

export const ProfileRevealStage = ref<(stage: StageId) => void>(() => {})
