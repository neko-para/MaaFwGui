import { GithubRepoId, GithubRepoInfo, KnownArch, KnownPlatform, ProjectId } from '@mfg/types'
import axios from 'axios'
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
                console.log(err)
                return false
            }
        }
        globalThis.main.github.exportRepo = async (id, tag) => {
            const repo = mfgApp.config.github?.repos?.find(x => x.id === id)
            if (!repo) {
                return false
            }

            return await this.checkoutVersion(repo, tag)
        }
    }

    async checkoutVersion(repo: GithubRepoInfo, tag: string) {
        if (!repo.meta) {
            return false
        }

        const octokit = new Octokit({
            auth: mfgApp.config.config?.githubAuthToken
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

                if (!(await extractAuto(asset.name, path.join(rootFolder, 'tree')))) {
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
            console.log(err)
            return false
        }
    }
}
