import { ResourceId } from '@mfg/types/resource'
import { dialog } from 'electron'
import path from 'path'

import { generateId } from '../utils/uuid'
import { window } from '../window'
import { mfgApp } from './app'

export class MfgResourceManager {
    async init() {
        globalThis.main.resource.query = async () => {
            return mfgApp.config.resource ?? []
        }
        globalThis.main.resource.new = async () => {
            const result = await dialog.showOpenDialog(window, {
                title: '打开 interface.json',
                filters: [
                    {
                        name: 'interface',
                        extensions: ['.json']
                    }
                ]
            })
            const file = result.filePaths[0]
            if (file) {
                let dir = path.dirname(file)
                if (['assets', 'install'].includes(path.basename(dir))) {
                    dir = path.dirname(dir)
                }
                mfgApp.config.resource = mfgApp.config.resource ?? []
                mfgApp.config.resource.push({
                    id: generateId() as ResourceId,
                    name: path.basename(dir),
                    path: file,
                    type: 'external'
                })
                await mfgApp.saveConfig()
            }
        }
    }
}
