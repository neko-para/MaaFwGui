import type { ProjectId } from '@mfg/types'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { projectInfo } from '@/states/project'

export function useProject() {
    const route = useRoute()

    const projectId = computed(() => route.params.id as ProjectId)

    const activeProjectInfo = computed(() => projectInfo.value.find(x => x.id === projectId.value))

    return {
        projectId,
        activeProjectInfo
    }
}
