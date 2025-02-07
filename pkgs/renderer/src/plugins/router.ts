import { createMemoryHistory, createRouter } from 'vue-router'

import VAbout from '@/views/VAbout.vue'
import VStartContent from '@/views/VStartContent.vue'
import VStartSide from '@/views/VStartSide.vue'

const routes = [
    { path: '/', components: { side: VStartSide, content: VStartContent } },
    { path: '/about', components: { side: VAbout, content: VAbout } }
]

export default createRouter({
    history: createMemoryHistory(),
    routes
})
