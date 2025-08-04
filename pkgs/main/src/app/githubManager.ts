import { KnownArch, KnownPlatform, ProjectId, ProjectUpdateChannel } from '@mfg/types'
import axios from 'axios'
import { safeStorage } from 'electron'
import { existsSync, statSync } from 'fs'
import * as fs from 'fs/promises'
import { Octokit } from 'octokit'
import * as path from 'path'

import { extractAuto } from '../utils/compress'
import { generateId } from '../utils/uuid'
import { mfgApp } from './app'

const genericHeaders = {
    'X-GitHub-Api-Version': '2022-11-28'
}

export class MfgGithubManager {
    async init() {
        if (!this.authToken && mfgApp.config.config?.githubLoginUser) {
            mfgApp.config.config.githubLoginUser = undefined
            await mfgApp.saveConfig()
        }

        globalThis.main.github.hasToken = () => {
            return !!this.authToken
        }
        globalThis.main.github.tryUpdateToken = async token => {
            const octokit = new Octokit({
                auth: token
            })
            try {
                const resp = await octokit.rest.users.getAuthenticated({
                    headers: genericHeaders
                })
                mfgApp.config.config = {
                    ...mfgApp.config.config,
                    githubLoginUser: `${resp.data.login}(${resp.data.name})`
                }
                this.authToken = token
                await mfgApp.saveConfig()
                return true
            } catch (err) {
                globalThis.renderer.utils.showToast('error', `请求失败: ${err}`)
                this.authToken = undefined
                await mfgApp.saveConfig()
                return false
            }
        }
        globalThis.main.github.cleanToken = async () => {
            this.authToken = undefined
            await mfgApp.saveConfig()
        }
    }

    async checkUpdate(owner: string, repo: string, channel: ProjectUpdateChannel) {
        const octokit = new Octokit({
            auth: this.authToken
        })

        try {
            const releases = await octokit.rest.repos.listReleases({
                owner,
                repo
            })

            const release = releases.data.find(rel => {
                if (/alpha/.test(rel.tag_name)) {
                    if (channel !== 'alpha') {
                        return false
                    }
                }
                if (/beta/.test(rel.tag_name)) {
                    if (channel !== 'beta') {
                        return false
                    }
                }
                return true
            })

            if (!release) {
                globalThis.renderer.utils.showToast('error', '未找到 release')
                return null
            }

            const platNames: Record<KnownPlatform, RegExp> = {
                win32: /[^r]win(dows|32)?/,
                linux: /linux/,
                darwin: /mac(os)?|darwin/
            }
            const archNames: Record<KnownArch, RegExp> = {
                x64: /x86(_64)?|x64|amd64/,
                arm64: /arm(64)?|aarch64/
            }
            const assets = release.assets.filter(x => {
                return (
                    platNames[process.platform as KnownPlatform].test(x.name) &&
                    archNames[process.arch as KnownArch].test(x.name)
                )
            })

            if (assets.length > 1) {
                // TODO: ask user to choose
                console.log(assets.map(x => x.name))
                globalThis.renderer.utils.showToast('error', '找到多个可能的制品')
                return null
            } else if (assets.length === 0) {
                globalThis.renderer.utils.showToast('error', '未找到制品')
                return null
            }

            const asset = assets[0]

            return {
                version: release.tag_name,
                notes: release.body ?? release.body_text,
                extension: asset.name.replace(/^[^.]+/, ''),
                download: (): axios.AxiosRequestConfig => {
                    return {
                        url: asset.browser_download_url,
                        responseType: 'arraybuffer',
                        headers: {
                            Authorization: this.authToken ? `Bear ${this.authToken}` : undefined
                        }
                    }
                }
            }
        } catch (err) {
            globalThis.renderer.utils.showToast('error', `请求失败: ${err}`)
            return null
        }
    }

    set authToken(token: string | undefined) {
        if (token === undefined) {
            mfgApp.config.config = {
                ...mfgApp.config.config,
                githubLoginUser: undefined
            }
            mfgApp.config.secConfig = {
                ...mfgApp.config.secConfig,
                githubAuthToken: undefined,
                githubAuthTokenRaw: undefined
            }
        } else {
            try {
                mfgApp.config.secConfig = {
                    ...mfgApp.config.secConfig,
                    githubAuthToken: safeStorage.encryptString(token).toString('base64'),
                    githubAuthTokenRaw: undefined
                }
            } catch (err) {
                globalThis.renderer.utils.showToast(
                    'warning',
                    `系统加密保存失败, 将使用明文保存 ${err}`
                )
                mfgApp.config.secConfig = {
                    ...mfgApp.config.secConfig,
                    githubAuthToken: undefined,
                    githubAuthTokenRaw: Buffer.from(token).toString('base64')
                }
            }
        }
    }

    get authToken() {
        if (mfgApp.config.secConfig?.githubAuthToken) {
            try {
                return safeStorage.decryptString(
                    Buffer.from(mfgApp.config.secConfig.githubAuthToken, 'base64')
                )
            } catch (err) {
                globalThis.renderer.utils.showToast('warning', `系统解密失败 ${err}`)
                return undefined
            }
        } else if (mfgApp.config.secConfig?.githubAuthTokenRaw) {
            try {
                return Buffer.from(mfgApp.config.secConfig.githubAuthTokenRaw, 'base64').toString(
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
