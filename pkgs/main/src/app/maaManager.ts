import { MaaLoader, MaaLoaderRegistry, maa, setMaa } from '@mfg/maa'
import path from 'path'

import { makeProgress } from '../utils/progress'
import { mfgApp } from './app'

export class MfgMaaManager {
    loader?: MaaLoader

    async init() {
        if (!mfgApp.config.maaOption) {
            mfgApp.config.maaOption = {
                root: path.join(mfgApp.root, 'native'),

                registry: 'cnpm',
                version: 'v4.4.1'
            }
            await mfgApp.saveConfig()
        }

        main.maa.init = async () => {
            if (!this.loader) {
                this.loader = new MaaLoader(mfgApp.config.maaOption!)
                await this.loader.init()
            }

            const prog = makeProgress()
            const m = await this.loader.load(state => {
                switch (state) {
                    case 'checking':
                        prog.update('MaaFramework: 检查安装中')
                        break
                    case 'preparing-folder':
                        prog.update('MaaFramework: 准备目录中')
                        break
                    case 'downloading-scripts':
                        prog.update('MaaFramework: 下载脚本中')
                        break
                    case 'downloading-binary':
                        prog.update('MaaFramework: 下载二进制中')
                        break
                    case 'moving-folder':
                        prog.update('MaaFramework: 移动目录中')
                        break
                    case 'succeeded':
                        prog.update('MaaFramework: 加载成功')
                        break
                    case 'failed':
                        prog.update('MaaFramework: 加载失败')
                        break
                }
            })
            setTimeout(() => {
                prog.end()
            }, 2000)

            if (m) {
                setMaa(m)

                globalThis.renderer.maa.versionChanged(m.Global.version)

                maa.Global.log_dir = mfgApp.root

                return true
            } else {
                return false
            }
        }
        main.maa.version = () => {
            return maa?.Global.version ?? null
        }
        main.maa.query = () => {
            return mfgApp.config.maaOption!
        }
        main.maa.setVersion = async (ver: string) => {
            mfgApp.config.maaOption!.version = ver
            await mfgApp.saveConfig()
        }
        main.maa.setRegistry = async (reg: MaaLoaderRegistry) => {
            mfgApp.config.maaOption!.registry = reg
            await mfgApp.saveConfig()
        }
        main.maa.allVersion = async () => {
            if (!this.loader) {
                this.loader = new MaaLoader(mfgApp.config.maaOption!)
                await this.loader.init()
            }

            const locals = new Set(await this.loader.allLocalVersions())
            const remotes = await this.loader.allRemoteVersions()
            return remotes.map(([version]) => {
                return {
                    version: `v${version}`,
                    downloaded: locals.has(`v${version}`)
                }
            })
        }
    }
}
