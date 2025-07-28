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
                const result = await octokit.rest.users.getAuthenticated({
                    headers: {
                        'X-GitHub-Api-Version': '2022-11-28'
                    }
                })
                mfgApp.config.config = {
                    ...mfgApp.config.config,
                    githubAuthToken: token,
                    githubLoginUser: `${result.data.login}(${result.data.name})`
                }
                await mfgApp.saveConfig()
                return true
            } catch (err) {
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
            mfgApp.config.github = mfgApp.config.github ?? {}
            mfgApp.config.github.repos = mfgApp.config.github.repos ?? []
            mfgApp.config.github.repos.push({
                id: generateId() as GithubRepoId,

                name: url.replace(/^.+\/([^/]+)(?:\/|\.git)?$/, '$1'),

                url
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
    }
}
