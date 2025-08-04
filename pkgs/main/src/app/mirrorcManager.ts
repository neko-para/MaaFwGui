import { ProjectUpdateChannel } from '@mfg/types'
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
    }

    async checkUpdate(rid: string, current: string | undefined, channel: ProjectUpdateChannel) {
        const result = await mirrorcRequest(rid, {
            cdk: this.authToken,
            current_version: current,
            channel
        })
        if (!result || typeof result === 'string') {
            await globalThis.renderer.utils.showToast(
                'error',
                result ? mirrorcErrorMsg[result] : '未知错误'
            )
            return false
        }

        return {
            version: result.version_name,
            notes: result.release_note,
            incremental: result.update_type === 'incremental',
            download: (): axios.AxiosRequestConfig | null => {
                return result.url
                    ? {
                          url: result.url,
                          responseType: 'arraybuffer'
                      }
                    : null
            }
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
