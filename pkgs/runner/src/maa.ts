import path from 'path'

import { maa, setMaa } from './data'

export async function setupMaa() {
    const maaDir = process.env['MFG_MAA_DIR']!
    const logDir = process.env['MFG_LOG_DIR']!

    module.paths.unshift(path.join(maaDir, 'node_modules'))

    try {
        let instance = require('@maaxyz/maa-node')
        setMaa(instance)

        maa.Global.log_dir = logDir
        return true
    } catch {
        return false
    }
}
