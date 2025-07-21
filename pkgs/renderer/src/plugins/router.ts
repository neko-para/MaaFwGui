import { type RouteRecordRaw, createMemoryHistory, createRouter } from 'vue-router'

import VAbout from '@/views/VAbout.vue'
import VStartContent from '@/views/VStartContent.vue'
import VStartSide from '@/views/VStartSide.vue'
import { Project, ProjectManage } from '@/views/project'

const routes = [
    { path: '/', redirect: '/project' },
    { path: '/device', components: { side: VStartSide, content: VStartContent } },
    { path: '/about', components: { side: VAbout, content: VAbout } },
    { path: '/project', components: ProjectManage },
    { path: '/project/:id', components: Project }
] satisfies RouteRecordRaw[]

export default createRouter({
    history: createMemoryHistory(),
    routes
})
