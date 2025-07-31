import axios from 'axios'
import { safeStorage } from 'electron'

import { mfgApp } from './app'

export class MfgMirrorcManager {
    async init() {
        globalThis.main.mirrorc.hasToken = () => {
            return !!this.authToken
        }
        globalThis.main.mirrorc.tryUpdateToken = async token => {
            const resp = await axios({
                url: 'https://mirrorchyan.com/api/resources/MaaFramework/latest',
                params: {
                    cdk: token,
                    user_agent: 'MaaFwGui',
                    os: process.platform,
                    arch: process.arch
                },
                responseType: 'json',
                validateStatus: () => true
            })
            console.log(resp.status, resp.data)
            if (resp.status === 403 && resp.data.code === 7001) {
                // 过期
                await globalThis.renderer.utils.showToast('error', 'CDK已过期')
                this.authToken = undefined
                await mfgApp.saveConfig()
                return false
            } else if (resp.status === 403 && resp.data.code === 7002) {
                // 无效
                await globalThis.renderer.utils.showToast('error', 'CDK无效')
                this.authToken = undefined
                await mfgApp.saveConfig()
                return false
                // } else if (resp.status === 403 && resp.data.code === 7003) {
                //     // 上限
                //     await globalThis.renderer.utils.showToast('warning', 'CDK已达今日使用上限')
                //     this.authToken = token
                //     await mfgApp.saveConfig()
                //     return true
            } else if (resp.status === 403 && resp.data.code === 7004) {
                // 类型错误
                await globalThis.renderer.utils.showToast('error', 'CDK类型错误')
                this.authToken = undefined
                await mfgApp.saveConfig()
                return false
            } else if (resp.status === 403 && resp.data.code === 7005) {
                // 封禁
                await globalThis.renderer.utils.showToast('error', 'CDK已被封禁')
                this.authToken = undefined
                await mfgApp.saveConfig()
                return false
            } else {
                this.authToken = token
                await mfgApp.saveConfig()
                return true
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
