import { createMemoryHistory, createRouter } from 'vue-router'

import AboutView from '@/views/VAbout.vue'

const routes = [
    { path: '/', components: { side: AboutView, content: AboutView } },
    { path: '/about', components: { side: AboutView, content: AboutView } }
]

export default createRouter({
    history: createMemoryHistory(),
    routes
})
