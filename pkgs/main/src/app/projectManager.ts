import { Interface, ProjectId, ProjectInfo } from '@mfg/types'
import axios from 'axios'
import { dialog } from 'electron'
import { existsSync } from 'fs'
import fs from 'fs/promises'
import * as path from 'path'

import { extractAuto } from '../utils/compress'
import { ProgressInstance, makeProgress } from '../utils/progress'
import { generateId } from '../utils/uuid'
import { window } from '../window'
import { mfgApp } from './app'

function extractGithubUrl(url: string) {
    let match = /github.com\/([^/]+)\/([^/]+)\/?/.exec(url)
    if (match) {
        return {
            owner: match[1],
            repo: match[2]
        }
    }

    match = /^([^/]+)\/([^/]+)$/.exec(url)
    if (match) {
        return {
            owner: match[1],
            repo: match[2]
        }
    }

    return null
}

function guessExtension(resp: axios.AxiosResponse<any, any>) {
    const disp = resp.headers['content-disposition']
    if (disp) {
        const filenameRegex = /filename\*?=(?:UTF-8''|")?([^;"']+)/i
        const matches = filenameRegex.exec(disp)
        if (matches != null && matches[1]) {
            const filename = decodeURIComponent(matches[1])
            return filename.substring(filename.indexOf('.'))
        }
    }

    switch (resp.headers['content-type']) {
        case 'application/zip':
            return '.zip'
        case 'application/x-gtar':
            return '.tar.gz'
    }

    return '.zip'
}

export class MfgProjectManager {
    interfaceCache: Record<ProjectId, Interface> = {}

    async init() {
        globalThis.main.project.query = async () => {
            return mfgApp.config.projects ?? []
        }
        globalThis.main.project.newExternal = async () => {
            const result = await dialog.showOpenDialog(window, {
                title: '打开 interface.json',
                filters: [
                    {
                        name: 'interface.json',
                        extensions: ['json']
                    }
                ]
            })
            if (result.filePaths.length === 0) {
                return false
            }
            const file = result.filePaths[0]
            if (path.basename(file) !== 'interface.json') {
                return false
            }
            let dir = path.dirname(file)
            if (['assets', 'install'].includes(path.basename(dir))) {
                dir = path.dirname(dir)
            }
            mfgApp.config.projects = mfgApp.config.projects ?? []
            mfgApp.config.projects.push({
                id: generateId(),
                name: path.basename(dir),
                type: 'external',
                path: file
            })
            await mfgApp.saveConfig()
            return true
        }
        globalThis.main.project.newArchive = async files => {
            if (!files || files.length === 0) {
                const result = await dialog.showOpenDialog(window, {
                    title: '打开资源包',
                    filters: [
                        {
                            name: '资源包',
                            extensions: ['zip', 'tar', 'gz']
                        }
                    ]
                })
                if (result.filePaths.length === 0) {
                    return false
                }
                files = result.filePaths
            }

            const prog = makeProgress()

            for (const file of files) {
                prog.update('解压中')

                if (!(await this.importArchive(file, undefined, prog))) {
                    prog.end()
                    return false
                }
            }
            prog.end()
            return true
        }
        globalThis.main.project.newGithub = async url => {
            const repo = extractGithubUrl(url)
            if (!repo) {
                globalThis.renderer.utils.showToast('error', '地址格式错误')
                return false
            }

            const prog = makeProgress()

            prog.update('获取索引中')
            const result = await mfgApp.githubManager.checkUpdate(repo.owner, repo.repo, 'stable')
            if (!result) {
                prog.end()
                return false
            }

            prog.update('下载中')
            let data: ArrayBuffer
            try {
                data = (
                    await axios({
                        ...result.download(),
                        onDownloadProgress: event => {
                            if (event.lengthComputable) {
                                prog.update('下载中', (event.loaded / (event.total ?? 1)) * 100)
                            }
                        }
                    })
                ).data
            } catch (err) {
                prog.end()
                globalThis.renderer.utils.showToast('error', `下载失败: ${err}`)
                return false
            }

            prog.update('解压中')
            await fs.mkdir(path.join(mfgApp.root, 'temp'), { recursive: true })
            const file = path.join(mfgApp.root, 'temp', generateId() + result.extension)
            await fs.writeFile(file, Buffer.from(data))
            const res = await this.importArchive(file, result.version, prog)
            await fs.unlink(file)

            prog.end()
            return res
        }
        globalThis.main.project.newMirrorc = async rid => {
            const prog = makeProgress()

            prog.update('获取索引中')
            const result = await mfgApp.mirrorcManager.checkUpdate(rid, undefined, 'stable')
            if (!result) {
                prog.end()
                return false
            }

            const cfg = result.download()
            if (!cfg) {
                prog.end()
                globalThis.renderer.utils.showToast('warning', '无CDK无法进行下载')
                return false
            }

            prog.update('下载中')
            let data: ArrayBuffer
            let extension: string | null = null
            try {
                const resp = await axios({
                    ...cfg,
                    onDownloadProgress: event => {
                        if (event.lengthComputable) {
                            prog.update('下载中', (event.loaded / (event.total ?? 1)) * 100)
                        }
                    }
                })
                data = resp.data
                extension = guessExtension(resp)
            } catch (err) {
                prog.end()
                globalThis.renderer.utils.showToast('error', `下载失败: ${err}`)
                return false
            }

            prog.update('解压中')
            await fs.mkdir(path.join(mfgApp.root, 'temp'), { recursive: true })
            const file = path.join(mfgApp.root, 'temp', generateId() + extension)
            await fs.writeFile(file, Buffer.from(data))
            const res = await this.importArchive(file, result.version, prog)
            await fs.unlink(file)

            prog.end()
            return res
        }
        globalThis.main.project.update = async (id, cfg) => {
            if (!mfgApp.config.projects) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return
            }

            const project = mfgApp.config.projects.find(x => x.id === id)
            if (!project) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return
            }

            Object.assign(project, cfg)
            await mfgApp.saveConfig()
        }
        globalThis.main.project.del = async id => {
            if (!mfgApp.config.projects) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return false
            }

            const projectIndex = mfgApp.config.projects.findIndex(x => x.id === id)
            if (projectIndex === -1) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return false
            }

            const project = mfgApp.config.projects[projectIndex]

            for (const profile of mfgApp.config.profiles ?? []) {
                for (const stage of profile.stages) {
                    if (stage.project === id) {
                        globalThis.renderer.utils.showToast('error', '项目已被引用')
                        return false
                    }
                }
            }

            if (project.type === 'managed') {
                await fs.rm(path.join(mfgApp.root, 'projects', project.id), { recursive: true })
            }

            mfgApp.config.projects.splice(projectIndex, 1)
            await mfgApp.saveConfig()

            return true
        }
        globalThis.main.project.delGithub = async id => {
            if (!mfgApp.config.projects) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return false
            }

            const project = mfgApp.config.projects.find(x => x.id === id)
            if (!project) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return false
            }

            delete project.github
            await mfgApp.saveConfig()
            return true
        }
        globalThis.main.project.bindGithub = async (id, url) => {
            if (!mfgApp.config.projects) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return false
            }

            const project = mfgApp.config.projects.find(x => x.id === id)
            if (!project) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return false
            }

            if (project.github) {
                globalThis.renderer.utils.showToast('error', '已关联到Github')
                return false
            }

            const repo = extractGithubUrl(url)
            if (!repo) {
                globalThis.renderer.utils.showToast('error', '地址格式错误')
                return false
            }

            project.github = repo
            await mfgApp.saveConfig()
            return true
        }
        globalThis.main.project.delMirrorc = async id => {
            if (!mfgApp.config.projects) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return false
            }

            const project = mfgApp.config.projects.find(x => x.id === id)
            if (!project) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return false
            }

            delete project.mirrorc
            await mfgApp.saveConfig()
            return true
        }
        globalThis.main.project.bindMirrorc = async (id, rid) => {
            if (!mfgApp.config.projects) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return false
            }

            const project = mfgApp.config.projects.find(x => x.id === id)
            if (!project) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return false
            }

            if (project.mirrorc) {
                globalThis.renderer.utils.showToast('error', '已关联到Mirrorc')
                return false
            }

            project.mirrorc = { rid }
            await mfgApp.saveConfig()
            return true
        }
        globalThis.main.project.checkUpdate = async (id, via) => {
            if (!mfgApp.config.projects) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return false
            }

            const project = mfgApp.config.projects.find(x => x.id === id)
            if (!project) {
                globalThis.renderer.utils.showToast('error', '未找到指定项目')
                return false
            }

            const prog = makeProgress()

            if (via === 'github') {
                if (!project.github) {
                    prog.end()
                    globalThis.renderer.utils.showToast('error', '未关联到Github')
                    return false
                }

                prog.update('获取索引中')
                const result = await mfgApp.githubManager.checkUpdate(
                    project.github.owner,
                    project.github.repo,
                    project.channel ?? 'stable'
                )
                if (!result) {
                    prog.end()
                    return false
                }

                if (result.version === project.version) {
                    prog.end()
                    globalThis.renderer.utils.showToast('success', '已是最新版本')
                    return true
                }

                if (
                    !(await globalThis.renderer.project.updateFound(
                        result.version,
                        result.notes ?? '无更新日志'
                    ))
                ) {
                    prog.end()
                    return true
                }

                prog.update('下载中')
                let data: ArrayBuffer
                try {
                    data = (
                        await axios({
                            ...result.download(),
                            onDownloadProgress: event => {
                                if (event.lengthComputable) {
                                    prog.update('下载中', (event.loaded / (event.total ?? 1)) * 100)
                                }
                            }
                        })
                    ).data
                } catch (err) {
                    prog.end()
                    globalThis.renderer.utils.showToast('error', `下载失败: ${err}`)
                    return false
                }

                prog.update('解压中')
                if (!(await this.replaceArchive(project.id, data, result.extension, prog))) {
                    prog.end()
                    return false
                }

                project.version = result.version
                await mfgApp.saveConfig()

                prog.end()
                return true
            } else if (via === 'mirrorc') {
                if (!project.mirrorc) {
                    prog.end()
                    globalThis.renderer.utils.showToast('error', '未关联到Mirrorc')
                    return false
                }

                prog.update('获取索引中')
                const result = await mfgApp.mirrorcManager.checkUpdate(
                    project.mirrorc.rid,
                    project.version,
                    project.channel ?? 'stable'
                )
                if (!result) {
                    prog.end()
                    return false
                }

                if (result.version === project.version) {
                    prog.end()
                    globalThis.renderer.utils.showToast('success', '已是最新版本')
                    return true
                }

                if (
                    !(await globalThis.renderer.project.updateFound(
                        result.version,
                        result.notes ?? '无更新日志'
                    ))
                ) {
                    prog.end()
                    return true
                }

                const cfg = result.download()
                if (!cfg) {
                    prog.end()
                    globalThis.renderer.utils.showToast('warning', '无CDK无法进行下载')
                    return false
                }

                prog.update('下载中')
                let data: ArrayBuffer
                let extension: string | null = null
                try {
                    const resp = await axios({
                        ...cfg,
                        onDownloadProgress: event => {
                            if (event.lengthComputable) {
                                prog.update('下载中', (event.loaded / (event.total ?? 1)) * 100)
                            }
                        }
                    })
                    data = resp.data
                    extension = guessExtension(resp)
                } catch (err) {
                    prog.end()
                    globalThis.renderer.utils.showToast('error', `下载失败: ${err}`)
                    return false
                }

                prog.update('解压中')
                if (result.incremental) {
                    if (!(await this.applyIncreArchive(project.id, data, extension, prog))) {
                        prog.end()
                        return false
                    }
                } else {
                    if (!(await this.replaceArchive(project.id, data, extension, prog))) {
                        prog.end()
                        return false
                    }
                }

                project.version = result.version
                await mfgApp.saveConfig()

                prog.end()
                return true
            } else {
                prog.end()
                return false
            }
        }

        globalThis.main.project.load = async id => {
            return mfgApp.config.projects?.find(x => x.id === id) ?? null
        }
        globalThis.main.project.loadInterface = async id => {
            return this.loadInterface(id)
        }
    }

    async importArchive(file: string, ver?: string, prog?: ProgressInstance) {
        const pid = generateId<ProjectId>()

        const tempRoot = path.join(mfgApp.root, 'temp', pid)
        await fs.mkdir(tempRoot, { recursive: true })
        if (!(await extractAuto(file, tempRoot, prog))) {
            globalThis.renderer.utils.showToast('error', '解压失败')
            return false
        }

        let interfaceData: Interface
        try {
            interfaceData = JSON.parse(
                await fs.readFile(path.join(tempRoot, 'interface.json'), 'utf8')
            )
        } catch {
            globalThis.renderer.utils.showToast('error', '解析失败')
            await fs.rm(tempRoot, { recursive: true })
            return false
        }

        const managedRoot = path.join(mfgApp.root, 'projects', pid)
        await fs.mkdir(path.join(mfgApp.root, 'projects'), { recursive: true })
        await fs.rename(tempRoot, managedRoot)

        const projectInfo: ProjectInfo = {
            id: pid,
            name: interfaceData.name ?? '<未命名项目>',
            type: 'managed',
            path: path.join(managedRoot, 'interface.json'),
            version: ver ?? interfaceData.version
        }

        if (interfaceData.url) {
            const repo = extractGithubUrl(interfaceData.url)
            if (repo) {
                projectInfo.github = repo
            }
        }

        if (interfaceData.mirrorchyan_rid) {
            projectInfo.mirrorc = {
                rid: interfaceData.mirrorchyan_rid
            }
        }

        mfgApp.config.projects = mfgApp.config.projects ?? []
        mfgApp.config.projects.push(projectInfo)
        await mfgApp.saveConfig()
        return true
    }

    async replaceArchive(pid: ProjectId, data: ArrayBuffer, ext: string, prog?: ProgressInstance) {
        await fs.mkdir(path.join(mfgApp.root, 'temp'), { recursive: true })
        const file = path.join(mfgApp.root, 'temp', generateId() + ext)
        await fs.writeFile(file, Buffer.from(data))
        const tempRoot = path.join(mfgApp.root, 'temp', pid)
        await fs.mkdir(tempRoot, { recursive: true })
        if (!(await extractAuto(file, tempRoot, prog))) {
            globalThis.renderer.utils.showToast('error', '解压失败')
            await fs.unlink(file)
            return false
        }
        await fs.unlink(file)

        await fs.rm(path.join(mfgApp.root, 'projects', pid), { recursive: true })
        await fs.rename(tempRoot, path.join(mfgApp.root, 'projects', pid))

        return true
    }

    async applyIncreArchive(
        pid: ProjectId,
        data: ArrayBuffer,
        ext: string,
        prog?: ProgressInstance
    ) {
        await fs.mkdir(path.join(mfgApp.root, 'temp'), { recursive: true })
        const file = path.join(mfgApp.root, 'temp', generateId() + ext)
        await fs.writeFile(file, Buffer.from(data))
        const tempRoot = path.join(mfgApp.root, 'temp', pid)
        await fs.mkdir(tempRoot, { recursive: true })
        if (!(await extractAuto(file, tempRoot, prog))) {
            globalThis.renderer.utils.showToast('error', '解压失败')
            await fs.unlink(file)
            return false
        }
        await fs.unlink(file)

        if (!existsSync(path.join(tempRoot, 'changes.json'))) {
            await fs.rm(tempRoot, { recursive: true })
            return false
        }
        let meta: {
            added?: string[]
            deleted?: string[]
            modified?: string[]
        }
        try {
            meta = JSON.parse(await fs.readFile(path.join(tempRoot, 'changes.json'), 'utf8'))
        } catch {
            await fs.rm(tempRoot, { recursive: true })
            return false
        }

        const projRoot = path.join(mfgApp.root, 'projects', pid)
        for (const file of [
            ...(meta.added ?? []),
            ...(meta.deleted ?? []),
            ...(meta.modified ?? [])
        ]) {
            const from = path.join(tempRoot, file)
            const to = path.join(projRoot, file)
            if (existsSync(to)) {
                await fs.rm(to, { recursive: true })
            }
            if (existsSync(from)) {
                await fs.mkdir(path.dirname(to), { recursive: true })
                await fs.rename(from, to)
            }
        }

        await fs.rm(tempRoot, { recursive: true })

        return true
    }

    async loadInterface(pid: ProjectId) {
        if (this.interfaceCache[pid]) {
            return this.interfaceCache[pid]
        }

        const info = mfgApp.config.projects?.find(x => x.id === pid)
        if (!info) {
            globalThis.renderer.utils.showToast('error', '未找到指定项目')
            return null
        }
        try {
            const content = JSON.parse(await fs.readFile(info.path, 'utf8')) as Interface
            this.interfaceCache[pid] = content
            return content
        } catch {
            globalThis.renderer.utils.showToast('error', '加载项目失败')
            return null
        }
    }
}
