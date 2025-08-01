import { GithubRepoInfo, KnownArch, KnownPlatform, ProjectId } from '@mfg/types'
import axios from 'axios'
import { safeStorage } from 'electron'
import { existsSync } from 'fs'
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
        globalThis.main.github.queryRepo = () => {
            return mfgApp.config.github?.repos ?? []
        }
        globalThis.main.github.newRepo = async url => {
            const match = /^https:\/\/github.com\/(.+)\/(.+)(?:\.git|\/)?$/.exec(url)
            if (!match) {
                globalThis.renderer.utils.showToast('error', '仓库地址格式错误')
                return false
            }

            mfgApp.config.github = mfgApp.config.github ?? {}
            mfgApp.config.github.repos = mfgApp.config.github.repos ?? []
            mfgApp.config.github.repos.push({
                id: generateId(),

                name: match[2],

                url,
                owner: match[1],
                repo: match[2]
            })
            await mfgApp.saveConfig()
            return true
        }
        globalThis.main.github.delRepo = async id => {
            if (!mfgApp.config.github?.repos) {
                globalThis.renderer.utils.showToast('error', '未找到指定仓库')
                return false
            }

            const repoIndex = mfgApp.config.github.repos.findIndex(x => x.id === id) ?? -1
            if (repoIndex === -1) {
                globalThis.renderer.utils.showToast('error', '未找到指定仓库')
                return false
            }

            const repo = mfgApp.config.github.repos[repoIndex]
            if (repo.expose) {
                globalThis.renderer.utils.showToast('error', '仓库已被导出')
                return false
            }

            mfgApp.config.github.repos.splice(repoIndex, 1)
            await mfgApp.saveConfig()
            return true
        }
        globalThis.main.github.checkRepoUpdate = async id => {
            const repo = mfgApp.config.github?.repos?.find(x => x.id === id)
            if (!repo) {
                globalThis.renderer.utils.showToast('error', '未找到指定仓库')
                return false
            }

            const octokit = new Octokit({
                auth: this.authToken
            })

            try {
                const versions = (
                    await octokit.rest.repos.listReleases({
                        owner: repo.owner,
                        repo: repo.repo,
                        headers: genericHeaders
                    })
                ).data.map(x => x.tag_name)
                const latest = (
                    await octokit.rest.repos.getLatestRelease({
                        owner: repo.owner,
                        repo: repo.repo,
                        headers: genericHeaders
                    })
                ).data.tag_name
                repo.meta = {
                    versions,
                    latest
                }
                await mfgApp.saveConfig()
                return true
            } catch (err) {
                globalThis.renderer.utils.showToast('error', `请求失败: ${err}`)
                return false
            }
        }
        globalThis.main.github.exportRepo = async (id, tag) => {
            const repo = mfgApp.config.github?.repos?.find(x => x.id === id)
            if (!repo) {
                globalThis.renderer.utils.showToast('error', '未找到指定仓库')
                return false
            }

            return await this.checkoutVersion(repo, tag)
        }
    }

    async checkoutVersion(repo: GithubRepoInfo, tag: string) {
        if (!repo.meta) {
            globalThis.renderer.utils.showToast('error', '仓库无更新信息')
            return false
        }

        const octokit = new Octokit({
            auth: this.authToken
        })

        try {
            const resp = await octokit.rest.repos.getReleaseByTag({
                owner: repo.owner,
                repo: repo.repo,
                tag: tag,
                headers: genericHeaders
            })

            const platNames: Record<KnownPlatform, RegExp> = {
                win32: /[^r]win(dows|32)?/,
                linux: /linux/,
                darwin: /mac(os)?|darwin/
            }
            const archNames: Record<KnownArch, RegExp> = {
                x64: /x86(_64)?|x64|amd64/,
                arm64: /arm(64)?|aarch64/
            }
            const assets = resp.data.assets.filter(x => {
                return (
                    platNames[process.platform as KnownPlatform].test(x.name) &&
                    archNames[process.arch as KnownArch].test(x.name)
                )
            })
            if (assets.length !== 1) {
                // TODO: ask user to choose
                console.log(assets.map(x => x.name))
                globalThis.renderer.utils.showToast('error', '找到多个可能的制品')
                return false
            }
            const asset = assets[0]

            const rootFolder = path.join(mfgApp.root, 'github', repo.id, tag)
            await fs.mkdir(path.join(rootFolder, 'tarballs'), {
                recursive: true
            })

            const assetPath = path.join(rootFolder, 'tarballs', asset.name)
            if (!existsSync(assetPath)) {
                const release = (
                    await axios({
                        url: asset.browser_download_url,
                        responseType: 'arraybuffer',
                        headers: {
                            Authorization: this.authToken ? `Bear ${this.authToken}` : undefined
                        }
                    })
                ).data as ArrayBuffer
                await fs.writeFile(path.join(assetPath), Buffer.from(release))
            }

            if (!existsSync(path.join(rootFolder, 'done'))) {
                await fs.mkdir(path.join(rootFolder, 'tree'), { recursive: true })

                if (!(await extractAuto(asset.name, path.join(rootFolder, 'tree')))) {
                    globalThis.renderer.utils.showToast('error', '解压失败')
                    return false
                }
                await fs.writeFile(path.join(rootFolder, 'done'), Date.now().toString())
            }

            if (repo.expose) {
                const project = mfgApp.config.projects?.find(x => x.id === repo.expose!.project)
                if (!project) {
                    delete repo.expose
                } else {
                    repo.expose.version = tag
                    project.path = path.join(rootFolder, 'tree', 'interface.json')
                }
            }

            if (!repo.expose) {
                const pid = generateId<ProjectId>()

                mfgApp.config.projects = mfgApp.config.projects ?? []
                mfgApp.config.projects.push({
                    id: pid,
                    name: `${repo.name} <GITHUB>`,
                    path: path.join(rootFolder, 'tree', 'interface.json'),
                    type: 'managed',
                    github: repo.id
                })

                repo.expose = {
                    project: pid,
                    version: tag
                }
            }

            await mfgApp.saveConfig()
            return true
        } catch (err) {
            globalThis.renderer.utils.showToast('error', `请求失败: ${err}`)
            return false
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
