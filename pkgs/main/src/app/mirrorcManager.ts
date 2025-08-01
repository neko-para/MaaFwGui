import { MirrorcAppInfo, ProjectId } from '@mfg/types'
import axios from 'axios'
import * as crypto from 'crypto'
import { safeStorage } from 'electron'
import { existsSync } from 'fs'
import * as fs from 'fs/promises'
import * as path from 'path'

import { extractAuto } from '../utils/compress'
import { mirrorcErrorMsg, mirrorcRequest } from '../utils/mirrorc'
import { generateId } from '../utils/uuid'
import { mfgApp } from './app'

export class MfgMirrorcManager {
    async init() {
        globalThis.main.mirrorc.hasToken = () => {
            return !!this.authToken
        }
        globalThis.main.mirrorc.tryUpdateToken = async token => {
            const result = await mirrorcRequest('MaaFramework', { cdk: token })
            if (result && (typeof result !== 'string' || result === 'resource_quota_exhausted')) {
                this.authToken = token
                await mfgApp.saveConfig()
                return true
            } else {
                await globalThis.renderer.utils.showToast(
                    'error',
                    result ? mirrorcErrorMsg[result] : '未知错误'
                )
                this.authToken = undefined
                await mfgApp.saveConfig()
                return false
            }
        }
        globalThis.main.mirrorc.cleanToken = async () => {
            this.authToken = undefined
            await mfgApp.saveConfig()
        }
        globalThis.main.mirrorc.queryApp = () => {
            return mfgApp.config.mirrorc?.apps ?? []
        }
        globalThis.main.mirrorc.newApp = async rid => {
            if (!rid.length) {
                globalThis.renderer.utils.showToast('error', '应用名称格式错误')
                return false
            }

            mfgApp.config.mirrorc = mfgApp.config.mirrorc ?? {}
            mfgApp.config.mirrorc.apps = mfgApp.config.mirrorc.apps ?? []
            mfgApp.config.mirrorc.apps.push({
                id: generateId(),

                name: rid,

                rid
            })
            await mfgApp.saveConfig()
            return true
        }
        globalThis.main.mirrorc.delApp = async id => {
            if (!mfgApp.config.mirrorc?.apps) {
                globalThis.renderer.utils.showToast('error', '未找到指定应用')
                return false
            }

            const appIndex = mfgApp.config.mirrorc.apps.findIndex(x => x.id === id) ?? -1
            if (appIndex === -1) {
                globalThis.renderer.utils.showToast('error', '未找到指定应用')
                return false
            }

            const app = mfgApp.config.mirrorc.apps[appIndex]
            if (app.expose) {
                globalThis.renderer.utils.showToast('error', '应用已被导出')
                return false
            }

            mfgApp.config.mirrorc.apps.splice(appIndex, 1)

            await fs.rm(path.join(mfgApp.root, 'github', app.id), { recursive: true })

            await mfgApp.saveConfig()
            return true
        }
        globalThis.main.mirrorc.checkAppUpdate = async id => {
            const app = mfgApp.config.mirrorc?.apps?.find(x => x.id === id)
            if (!app) {
                globalThis.renderer.utils.showToast('error', '未找到指定仓库')
                return false
            }

            const result = await mirrorcRequest(app.rid, {
                cdk: this.authToken,
                current_version: app.meta?.latestDone
            })
            if (!result || typeof result === 'string') {
                await globalThis.renderer.utils.showToast(
                    'error',
                    result ? mirrorcErrorMsg[result] : '未知错误'
                )
                return false
            }

            app.meta = {
                ...app.meta,

                latest: result.version_name
            }
            await mfgApp.saveConfig()
            return true
        }
        globalThis.main.mirrorc.exportApp = async id => {
            const app = mfgApp.config.mirrorc?.apps?.find(x => x.id === id)
            if (!app) {
                globalThis.renderer.utils.showToast('error', '未找到指定应用')
                return false
            }

            return await this.upgradeApp(app)
        }
    }

    async upgradeApp(app: MirrorcAppInfo) {
        if (!app.meta) {
            globalThis.renderer.utils.showToast('error', '应用无更新信息')
            return false
        }

        const result = await mirrorcRequest(app.rid, {
            cdk: this.authToken,
            current_version: app.meta.latestDone
        })
        if (!result || typeof result === 'string') {
            await globalThis.renderer.utils.showToast(
                'error',
                result ? mirrorcErrorMsg[result] : '未知错误'
            )
            return false
        }

        const tag = result.version_name

        if (!result.url) {
            if (tag === app.meta.latestDone) {
                globalThis.renderer.utils.showToast('success', '已是最新')
                return true
            } else {
                globalThis.renderer.utils.showToast('warning', '无CDK无法进行更新')
                return false
            }
        }

        const isIncremental = result.update_type === 'incremental'

        if (isIncremental && !app.meta.latestDone) {
            globalThis.renderer.utils.showToast('error', '错误下发了增量包')
            return false
        }

        const rootFolder = path.join(mfgApp.root, 'mirrorc', app.id, tag)
        await fs.mkdir(path.join(rootFolder, 'tarballs'), {
            recursive: true
        })

        let data: ArrayBuffer

        app.meta.tarballs = app.meta.tarballs ?? []
        let tarballIndex = app.meta.tarballs.find(x => {
            if (x.version !== tag) {
                return false
            }
            if (isIncremental) {
                return x.version_from === app.meta!.latestDone
            } else {
                return x.version_from === undefined
            }
        })

        let needDownload = true
        if (tarballIndex) {
            const asset = path.join(rootFolder, 'tarballs', tarballIndex.filename)
            if (existsSync(asset)) {
                const hasher = crypto.createHash('sha256')
                hasher.update(await fs.readFile(asset))
                const current = hasher.digest('hex')
                if (current === result.sha256) {
                    needDownload = false
                } else {
                    console.log('sha256 mismatch, current:', current, 'expected:', result.sha256)
                }
            }
        } else {
            tarballIndex = {
                version: tag,
                version_from: isIncremental ? app.meta.latestDone : undefined,
                filename: ''
            }
            app.meta.tarballs.push(tarballIndex)
        }

        if (needDownload) {
            let filename = `${app.rid}-${result.version_name}.zip`
            if (isIncremental) {
                filename = `from-${app.meta.latestDone}-${app.rid}-${result.version_name}.zip`
            }
            try {
                const resp = await axios({
                    url: result.url,
                    responseType: 'arraybuffer'
                })
                data = resp.data

                console.log(resp.headers['content-type'])

                const disp = resp.headers['content-disposition']
                if (disp) {
                    const filenameRegex = /filename\*?=(?:UTF-8''|")?([^;"']+)/i
                    const matches = filenameRegex.exec(disp)
                    if (matches != null && matches[1]) {
                        filename = decodeURIComponent(matches[1])
                        console.log('mirrorc provide filename', filename)
                        if (isIncremental && filename.includes(app.meta!.latestDone!)) {
                            // 下载产物里面没带前序版本号
                            filename = `from-${app.meta.latestDone}-${filename}`
                        }
                    }
                }
            } catch (err) {
                globalThis.renderer.utils.showToast('error', `请求失败: ${err}`)
                return false
            }

            if (tarballIndex.filename !== filename) {
                const oldAsset = path.join(rootFolder, 'tarballs', tarballIndex.filename)
                if (tarballIndex.filename.length > 0 && existsSync(oldAsset)) {
                    await fs.unlink(oldAsset)
                }
                tarballIndex.filename = filename
            }

            await fs.writeFile(path.join(rootFolder, 'tarballs', filename), Buffer.from(data))
        }

        const assetPath = path.join(rootFolder, 'tarballs', tarballIndex.filename)

        if (needDownload) {
            await fs.rm(path.join(rootFolder, 'done'), { force: true })
            await fs.rm(path.join(rootFolder, 'tree'), { force: true })
        }

        if (!existsSync(path.join(rootFolder, 'done'))) {
            await fs.mkdir(path.join(rootFolder, 'tree'), { recursive: true })

            if (isIncremental) {
                // TODO: 复制一份现有的然后解压
                globalThis.renderer.utils.showToast('error', '暂不支持增量更新')
                return false
            } else {
                if (!(await extractAuto(assetPath, path.join(rootFolder, 'tree')))) {
                    globalThis.renderer.utils.showToast('error', '解压失败')
                    return false
                }
                await fs.writeFile(path.join(rootFolder, 'done'), Date.now().toString())
            }
        }
        app.meta.latestDone = tag

        if (app.expose) {
            const project = mfgApp.config.projects?.find(x => x.id === app.expose!.project)
            if (!project) {
                delete app.expose
            } else {
                app.expose.version = tag
                project.path = path.join(rootFolder, 'tree', 'interface.json')
            }
        }

        if (!app.expose) {
            const pid = generateId<ProjectId>()

            mfgApp.config.projects = mfgApp.config.projects ?? []
            mfgApp.config.projects.push({
                id: pid,
                name: `${app.name} <MirrorChyan>`,
                path: path.join(rootFolder, 'tree', 'interface.json'),
                type: 'managed',
                mirrorc: app.id
            })

            app.expose = {
                project: pid,
                version: tag
            }
        }

        await mfgApp.saveConfig()
        return true
    }

    set authToken(token: string | undefined) {
        if (token === undefined) {
            mfgApp.config.secConfig = {
                ...mfgApp.config.secConfig,
                mirrorChyanToken: undefined,
                mirrorChyanTokenRaw: undefined
            }
        } else {
            try {
                mfgApp.config.secConfig = {
                    ...mfgApp.config.secConfig,
                    mirrorChyanToken: safeStorage.encryptString(token).toString('base64'),
                    mirrorChyanTokenRaw: undefined
                }
            } catch (err) {
                globalThis.renderer.utils.showToast(
                    'warning',
                    `系统加密保存失败, 将使用明文保存 ${err}`
                )
                mfgApp.config.secConfig = {
                    ...mfgApp.config.secConfig,
                    mirrorChyanToken: undefined,
                    mirrorChyanTokenRaw: Buffer.from(token).toString('base64')
                }
            }
        }
    }

    get authToken() {
        if (mfgApp.config.secConfig?.mirrorChyanToken) {
            try {
                return safeStorage.decryptString(
                    Buffer.from(mfgApp.config.secConfig.mirrorChyanToken, 'base64')
                )
            } catch (err) {
                globalThis.renderer.utils.showToast('warning', `系统解密失败 ${err}`)
                return undefined
            }
        } else if (mfgApp.config.secConfig?.mirrorChyanTokenRaw) {
            try {
                return Buffer.from(mfgApp.config.secConfig.mirrorChyanTokenRaw, 'base64').toString(
                    'utf8'
                )
            } catch {
                return undefined
            }
        } else {
            return undefined
        }
    }
}
