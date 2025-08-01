import { safeStorage } from 'electron'

import { mirrorcErrorMsg, mirrorcRequest } from '../utils/mirrorc'
import { mfgApp } from './app'

export class MfgMirrorcManager {
    async init() {
        globalThis.main.mirrorc.hasToken = () => {
            return !!this.authToken
        }
        globalThis.main.mirrorc.tryUpdateToken = async token => {
            const result = await mirrorcRequest('MaaFramework', token)
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
