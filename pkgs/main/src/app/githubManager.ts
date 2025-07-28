import { mfgApp } from './app'

export class MfgGithubManager {
    async init() {
        globalThis.main.github.queryRepo = () => {
            return mfgApp.config.github?.repos ?? []
        }
        globalThis.main.github.newRepo = async url => {
            return false
        }
    }
}
