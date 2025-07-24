import { type RouteRecordRaw, createMemoryHistory, createRouter } from 'vue-router'

import VAbout from '@/views/VAbout.vue'
import { DeviceManage } from '@/views/device'
import { Profile, ProfileManage } from '@/views/profile'
import { Stage } from '@/views/profile/stage'
import { Project, ProjectManage } from '@/views/project'

const routes = [
    { path: '/', redirect: '/profile' },
    { path: '/about', components: { side: VAbout, content: VAbout } },
    { path: '/profile', components: ProfileManage },
    { path: '/profile/:profile_id', components: Profile },
    { path: '/profile/:profile_id/stage/:stage_id', components: Stage },
    { path: '/project', components: ProjectManage },
    { path: '/project/:project_id', components: Project },
    { path: '/device', components: DeviceManage },
    { path: '/device/:device_id', components: DeviceManage }
] satisfies RouteRecordRaw[]

export default createRouter({
    history: createMemoryHistory(),
    routes
})
