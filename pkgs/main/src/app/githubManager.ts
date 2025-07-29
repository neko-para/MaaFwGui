import { GithubRepoId, KnownArch, KnownPlatform, ProjectId, SystemInfo } from '@mfg/types'
import axios from 'axios'
import { existsSync } from 'fs'
import * as fs from 'fs/promises'
import { Octokit } from 'octokit'
import * as path from 'path'
import unzipper from 'unzipper'

import { generateId } from '../utils/uuid'
import { mfgApp } from './app'

// 目前esbuild配置有点问题, 导致默认会找到esm的实现上, 之后看怎么处理下
const tar = require('tar')

export class MfgGithubManager {
    async init() {
        globalThis.main.github.tryUpdateToken = async token => {
            const octokit = new Octokit({
                auth: token
            })
            try {
                const resp = await octokit.rest.users.getAuthenticated({
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                })
                mfgApp.config.config = {
                    ...mfgApp.config.config,
                    githubAuthToken: token,
                    githubLoginUser: `${resp.data.login}(${resp.data.name})`
                }
                await mfgApp.saveConfig()
                return true
            } catch (err) {
                console.log(err)
                mfgApp.config.config = {
                    ...mfgApp.config.config,
                    githubAuthToken: '',
                    githubLoginUser: ''
                }
                await mfgApp.saveConfig()
                return false
            }
        }
        globalThis.main.github.queryRepo = () => {
            return mfgApp.config.github?.repos ?? []
        }
        globalThis.main.github.newRepo = async url => {
            const match = /^https:\/\/github.com\/(.+)\/(.+)(?:\.git|\/)?$/.exec(url)
            if (!match) {
                return false
            }

            mfgApp.config.github = mfgApp.config.github ?? {}
            mfgApp.config.github.repos = mfgApp.config.github.repos ?? []
            mfgApp.config.github.repos.push({
                id: generateId() as GithubRepoId,

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
                return false
            }

            const repoIndex = mfgApp.config.github.repos.findIndex(x => x.id === id) ?? -1
            if (repoIndex === -1) {
                return false
            }

            const repo = mfgApp.config.github.repos[repoIndex]
            if (repo.expose) {
                return false
            }

            mfgApp.config.github.repos.splice(repoIndex, 1)
            await mfgApp.saveConfig()
            return true
        }
        globalThis.main.github.checkRepoUpdate = async id => {
            const repo = mfgApp.config.github?.repos?.find(x => x.id === id)
            if (!repo) {
                return false
            }

            const octokit = new Octokit({
                auth: mfgApp.config.config?.githubAuthToken
            })

            try {
                const resp = await octokit.rest.repos.getLatestRelease({
                    owner: repo.owner,
                    repo: repo.repo,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                })
                repo.update = {
                    version: resp.data.tag_name
                }
                await mfgApp.saveConfig()
                return true
            } catch (err) {
                console.log(err)
                return false
            }
        }
        globalThis.main.github.exportRepo = async id => {
            const repo = mfgApp.config.github?.repos?.find(x => x.id === id)
            if (!repo) {
                return false
            }

            if (!repo.update || repo.expose) {
                return false
            }

            const octokit = new Octokit({
                auth: mfgApp.config.config?.githubAuthToken
            })

            try {
                const resp = await octokit.rest.repos.getReleaseByTag({
                    owner: repo.owner,
                    repo: repo.repo,
                    tag: repo.update.version,
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
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
                    return false
                }
                const asset = assets[0]

                const rootFolder = path.join(mfgApp.root, 'github', repo.update.version)
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
                                Authorization: mfgApp.config.config?.githubAuthToken
                                    ? `Bear ${mfgApp.config.config.githubAuthToken}`
                                    : undefined
                            }
                        })
                    ).data as ArrayBuffer
                    await fs.writeFile(path.join(assetPath), Buffer.from(release))
                }

                if (!existsSync(path.join(rootFolder, 'done'))) {
                    await fs.mkdir(path.join(rootFolder, 'tree'), { recursive: true })
                    if (
                        asset.name.endsWith('.tar.gz') ||
                        asset.name.endsWith('.tar') ||
                        asset.name.endsWith('.tgz')
                    ) {
                        await tar.x({
                            file: assetPath,
                            cwd: path.join(rootFolder, 'tree')
                        })
                    } else if (asset.name.endsWith('.zip')) {
                        const file = await unzipper.Open.file(assetPath)
                        await file.extract({
                            path: path.join(rootFolder, 'tree')
                        })
                    } else {
                        console.log('unknown format', asset.name)
                        return false
                    }
                    await fs.writeFile(path.join(rootFolder, 'done'), Date.now().toString())
                }

                const pid = generateId() as ProjectId

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
                    version: repo.update.version
                }

                await mfgApp.saveConfig()
                return true
            } catch (err) {
                console.log(err)
                return false
            }
        }
    }
}
