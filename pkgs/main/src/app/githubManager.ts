import { GithubRepoId } from '@mfg/types'
import { Octokit } from 'octokit'

import { generateId } from '../utils/uuid'
import { mfgApp } from './app'

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
    }
}
