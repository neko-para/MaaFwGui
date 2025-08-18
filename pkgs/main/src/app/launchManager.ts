import { maa } from '@mfg/maa'
import {
    Interface,
    LaunchId,
    LaunchInfo,
    LaunchPrepareStatus,
    LaunchStatus,
    ProfileId,
    RunnerMessage,
    StageInfo,
    TaskInfo
} from '@mfg/types'
import * as child_process from 'child_process'
import * as path from 'path'

import { makeProgress } from '../utils/progress'
import { generateId } from '../utils/uuid'
import { mfgApp } from './app'
import { MfgMaaManager } from './maaManager'

export class MfgLaunchManager {
    launchIndex: Record<ProfileId, LaunchId> = {}
    launchInfo: Record<LaunchId, LaunchInfo> = {}
    launchRunner: Record<LaunchId, child_process.ChildProcess> = {}

    async init() {
        main.launch.new = async id => {
            if (!maa) {
                globalThis.renderer.utils.showToast('error', '未加载MaaFramework')
                return
            }

            const profile = mfgApp.config.profiles?.find(x => x.id === id)
            if (!profile) {
                globalThis.renderer.utils.showToast('error', '未找到指定方案')
                return
            }
            if (this.launchIndex[id]) {
                globalThis.renderer.utils.showToast('error', '方案存在其它执行记录')
                return
            }

            const lid = generateId<LaunchId>()
            this.launchIndex[id] = lid
            this.launchInfo[lid] = {
                id: lid,
                status: {
                    profile: id,

                    stages: {},
                    prepares: [],
                    tasks: {}
                },
                instance: {}
            }
            await globalThis.renderer.launch.updateIndex(this.launchIndex)
            await globalThis.renderer.launch.updateStatus(lid, this.launchInfo[lid].status)
            this.launch(id)
        }
        main.launch.stop = async id => {
            const launch = this.launchInfo[id]
            if (!launch) {
                globalThis.renderer.utils.showToast('error', '未找到指定执行记录')
                return
            }

            launch.status.stopped = true
            await globalThis.renderer.launch.updateStatus(id, launch.status)

            // 这里其实应该通知runner去退出, 比如post_stop, 但是直接杀了也挺好
            this.launchRunner[launch.id]?.kill('SIGKILL')
        }
        main.launch.del = async id => {
            const launch = this.launchInfo[id]
            if (!launch) {
                globalThis.renderer.utils.showToast('error', '未找到指定执行记录')
                return
            }
            if (!launch.status.stopped) {
                globalThis.renderer.utils.showToast('error', '执行尚未停止')
                return
            }
            delete this.launchIndex[launch.status.profile]
            delete this.launchInfo[id]

            await globalThis.renderer.launch.updateIndex(this.launchIndex)
            await globalThis.renderer.launch.updateStatus(id)
        }
        main.launch.syncIndex = () => {
            return this.launchIndex
        }
        main.launch.syncStatus = () => {
            return Object.fromEntries(
                Object.entries(this.launchInfo).map(
                    ([lid, info]) => [lid, info.status] as [LaunchId, LaunchStatus]
                )
            )
        }
    }

    async launch(pid: ProfileId) {
        const profile = mfgApp.config.profiles?.find(x => x.id === pid)
        if (!profile) {
            globalThis.renderer.utils.showToast('error', '未找到指定方案')
            return
        }
        const lid = this.launchIndex[pid]
        if (!lid) {
            globalThis.renderer.utils.showToast('error', '未找到指定执行记录')
            return
        }
        const launch = this.launchInfo[lid]
        for (const stage of profile.stages) {
            if (launch.status.stopped) {
                break
            }

            if (!(await this.launchStage(launch, stage))) {
                break
            }

            this.launchRunner[launch.id]?.kill('SIGKILL')
            delete this.launchRunner[launch.id]
        }

        this.launchRunner[launch.id]?.kill('SIGKILL')
        delete this.launchRunner[launch.id]

        launch.status.stopped = true
        await globalThis.renderer.launch.updateStatus(lid, launch.status)
    }

    async launchStage(launch: LaunchInfo, stage: StageInfo) {
        if (!stage.project) {
            globalThis.renderer.utils.showToast('error', '未指定项目')
            return false
        }

        const interfaceData = await mfgApp.projectManager.loadInterface(stage.project)
        if (!interfaceData) {
            // loadInterface里面会弹toast, 这就不弹了
            // globalThis.renderer.utils.showToast('error', '加载项目失败')
            return false
        }

        let maaVer = 'v4.4.1'

        const prog = makeProgress()
        let loadMaa = mfgApp.maaManager.loader!.prepare(maaVer, MfgMaaManager.printStatus(prog))
        setTimeout(() => {
            prog.end()
        }, 2000)

        if (!loadMaa) {
            globalThis.renderer.utils.showToast('error', '准备MaaFramework失败')
            return false
        }

        const proj = mfgApp.config.projects?.find(x => x.id === stage.project)
        if (!proj) {
            // 按理说不应该, 大概是用户在搞事
            globalThis.renderer.utils.showToast('error', '未找到指定项目')
            return false
        }
        const projectDir = path.dirname(proj.path)

        const env: Record<string, string> = {
            ...process.env,

            ELECTRON_RUN_AS_NODE: '1',

            MFG_MAA_DIR: mfgApp.maaManager.loader!.folderFor(maaVer),
            MFG_LOG_DIR: projectDir,

            MFG_INTERFACE: JSON.stringify(interfaceData),
            MFG_LAUNCH: JSON.stringify(launch),
            MFG_STAGE: JSON.stringify(stage),
            MFG_PROJECT_DIR: projectDir
        }
        if (stage.adb) {
            const dev = mfgApp.config.devices?.find(x => x.id === stage.adb)
            if (dev) {
                env['MFG_DEV'] = JSON.stringify(dev)
            }
        }

        const runner = child_process.fork(path.join(__dirname, '../runner/main.js'), {
            execPath: process.execPath,
            env,
            stdio: 'inherit'
        })
        this.launchRunner[launch.id] = runner

        runner.on('message', (msg: RunnerMessage) => {
            switch (msg.type) {
                case 'updateStatus':
                    launch.status = msg.status
                    globalThis.renderer.launch.updateStatus(launch.id, msg.status)
                    break
                case 'showError':
                    globalThis.renderer.utils.showToast('error', msg.error)
                    break
                case 'setActiveOutput':
                    globalThis.renderer.launch.setActiveOutput(launch.id, msg.output)
                    break
                case 'addOutput':
                    globalThis.renderer.launch.addOutput(
                        launch.id,
                        stage.id,
                        msg.category,
                        msg.output
                    )
                    break
                case 'showFocus':
                    globalThis.renderer.utils.showToast('info', msg.focus)
                    break
            }
        })

        let resolve: (v: boolean) => void
        const result = new Promise<boolean>(res => {
            resolve = res
        })

        runner.on('close', code => {
            resolve(code === 0)
        })

        return result
    }
}
