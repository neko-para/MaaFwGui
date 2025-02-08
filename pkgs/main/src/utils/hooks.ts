import { SystemInfo } from '@mfg/types'

import { generateId } from './uuid'

export function initUtils() {
    globalThis.main.utils.generateId = generateId

    globalThis.main.utils.querySystemInfo = () => ({
        platform: process.platform as SystemInfo['platform']
    })
}
