import { Octokit } from 'octokit'

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
            return false
        }
    }
}
