import { createApp } from 'vue'

import App from '@/App.vue'
import '@/assets/icon.png'
import '@/base.css'
import '@/ipc'
import router from '@/plugins/router'
import { initLaunchHooks } from '@/states/launch'

const meta = document.createElement('meta')
meta.name = 'naive-ui-style'
document.head.appendChild(meta)

createApp(App).use(router).mount('#app')

initLaunchHooks()
