import { type RouteRecordRaw, createMemoryHistory, createRouter } from 'vue-router'

import VAbout from '@/views/VAbout.vue'
import VStartContent from '@/views/VStartContent.vue'
import VStartSide from '@/views/VStartSide.vue'
import Resource from '@/views/resource'

const routes = [
    { path: '/', redirect: '/resource' },
    { path: '/device', components: { side: VStartSide, content: VStartContent } },
    { path: '/about', components: { side: VAbout, content: VAbout } },
    { path: '/resource', components: Resource }
] satisfies RouteRecordRaw[]

export default createRouter({
    history: createMemoryHistory(),
    routes
})
