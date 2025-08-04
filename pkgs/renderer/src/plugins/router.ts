import { type RouteRecordRaw, createMemoryHistory, createRouter } from 'vue-router'

import { Device } from '@/views/device'
import { MirrorcApp } from '@/views/mirrorc'
import { Profile } from '@/views/profile'
import { Stage } from '@/views/profile/stage'
import { Project } from '@/views/project'
import { Settings } from '@/views/settings'

const routes = [
    { path: '/', redirect: '/profile' },
    { path: '/settings', components: Settings },
    { path: '/profile', components: Profile },
    { path: '/profile/:profile_id', components: Profile },
    { path: '/profile/:profile_id/stage', components: Stage },
    { path: '/profile/:profile_id/stage/:stage_id', components: Stage },
    { path: '/project', components: Project },
    { path: '/project/:project_id', components: Project },
    { path: '/device', components: Device },
    { path: '/device/:device_id', components: Device },
    { path: '/mirrorc-app', components: MirrorcApp },
    { path: '/mirrorc-app/:mirrorc_app_id', components: MirrorcApp }
] satisfies RouteRecordRaw[]

export default createRouter({
    history: createMemoryHistory(),
    routes
})
