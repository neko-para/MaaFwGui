import { MaaLoader, MaaLoaderOption, maa, setMaa } from '@mfg/maa'
import {
    AdbDevice,
    Interface,
    LaunchActiveOutput,
    LaunchInfo,
    LaunchPrepareStatus,
    RunnerMessage,
    StageInfo,
    TaskInfo
} from '@mfg/types'
import child_process from 'child_process'
import path from 'path'

function escape_win32(arg: string) {
    if (arg.length === 0) {
        return '"'.repeat(2) // 等价于 C++: os_string(2, '"')
    }

    let space = false
    let len = arg.length

    for (const ch of arg) {
        switch (ch) {
            case '"':
            case '\\':
                len += 1
                break
            case ' ':
            case '\t':
                space = true
                break
        }
    }

    if (space) {
        len += 2
    }

    if (len === arg.length) {
        return arg
    }

    // 使用数组而不是预分配字符串 & reserve
    let buf = []

    if (space) {
        buf.push('"')
    }

    let slash = 0

    for (const ch of arg) {
        switch (ch) {
            case '\\':
                slash += 1
                buf.push('\\')
                break
            case '"':
                buf.push('\\'.repeat(slash + 1))
                buf.push('"')
                slash = 0
                break
            default:
                slash = 0
                buf.push(ch)
        }
    }
    if (space) {
        buf.push('\\'.repeat(slash))
        buf.push('"')
    }

    return buf.join('')
}

function escape_posix(arg: string) {
    return JSON.stringify(arg) // 基本上差不多
}

type FocusNotify = {
    start: string[]
    succeeded: string[]
    failed: string[]
    toast?: string
}

function parseFocus(data: unknown): FocusNotify {
    const result: FocusNotify = {
        start: [],
        succeeded: [],
        failed: []
    }
    if (typeof data !== 'object' || data === null) {
        return result
    }
    const check = (v: unknown): v is string | string[] => {
        return (
            typeof v === 'string' ||
            (Array.isArray(v) && v.map(x => typeof x === 'string').reduce((a, b) => a && b, true))
        )
    }
    const wrap = (v: string | string[]) => {
        return typeof v === 'string' ? [v] : v
    }
    if ('start' in data && check(data.start)) {
        result.start = wrap(data.start)
    }
    if ('succeeded' in data && check(data.succeeded)) {
        result.succeeded = wrap(data.succeeded)
    }
    if ('failed' in data && check(data.failed)) {
        result.failed = wrap(data.failed)
    }
    if ('toast' in data && typeof data.toast === 'string') {
        result.toast = data.toast
    }
    return result
}

async function setupMaa() {
    const option = JSON.parse(process.env['MFG_MAA_LOADER_OPTION']!) as MaaLoaderOption
    const logDir = process.env['MFG_LOG_DIR']!

    const loader = new MaaLoader(option)
    await loader.init()

    const m = await loader.load()
    if (!m) {
        return false
    }

    setMaa(m)

    maa.Global.log_dir = logDir

    return true
}

let interfaceData: Interface
let launch: LaunchInfo
let stage: StageInfo
let projectDir: string
let dev: AdbDevice | undefined

function pushMessage(msg: RunnerMessage) {
    process.send?.(msg)
}

function pushStatus() {
    pushMessage({
        type: 'updateStatus',
        status: launch.status
    })
}

function pushError(error: string) {
    pushMessage({
        type: 'showError',
        error
    })
}

function pushActiveOutput(output: LaunchActiveOutput) {
    pushMessage({
        type: 'setActiveOutput',
        output
    })
}

function pushOutput(category: 'agent' | 'focus', output: string) {
    pushMessage({
        type: 'addOutput',
        category,
        output
    })
}

function pushFocus(focus: string) {
    pushMessage({
        type: 'showFocus',
        focus
    })
}

async function launchStage() {
    launch.status.stages[stage.id] = 'running'
    pushStatus()

    const result = await launchStageImpl()
    launch.status.stages[stage.id] = result ? 'succeeded' : 'failed'
    pushStatus()

    await resetInstance()

    return result
}

async function launchStageImpl() {
    if (!stage.project) {
        pushError('未指定项目')
        return false
    }

    if (!(await prepareInstance())) {
        return false
    }

    pushActiveOutput({
        type: 'focus',
        stage: stage.id
    })
    for (const task of stage.tasks ?? []) {
        if (launch.status.stopped) {
            return false
        }

        launch.status.tasks[task.id] = 'running'
        pushStatus()

        const result = await launchTask(task)

        launch.status.tasks[task.id] = result ? 'succeeded' : 'failed'
        pushStatus()

        if (!result) {
            return false
        }
    }

    return true
}

async function resetInstance() {
    // 等连接完成, 不然挂了
    await launch.instance.postConn
    // 必须等待由于post_stop产生的任务完成，否则其回调会和这里的destroy死锁
    await launch.instance.postStop

    launch.instance.agent?.kill()
    launch.instance.agent = undefined

    launch.instance.tasker?.destroy()
    launch.instance.tasker = undefined
    launch.instance.controller?.destroy()
    launch.instance.controller = undefined

    launch.instance.client?.destroy()
    launch.instance.client = undefined

    launch.instance.resource?.destroy()
    launch.instance.resource = undefined
}

async function prepareInstance() {
    const result = await prepareInstanceImpl()
    if (!result) {
        await resetInstance()
    }
    return result
}

async function prepareInstanceImpl() {
    let agentStatus: LaunchPrepareStatus | null = null
    if (interfaceData.agent) {
        agentStatus = {
            stage: '连接Agent'
        }
    }
    if (agentStatus) {
        launch.status.prepares.push(agentStatus)
    }

    const connectStatus: LaunchPrepareStatus = {
        stage: '连接设备'
    }
    launch.status.prepares.push(connectStatus)

    pushStatus()

    if (!stage.resource) {
        pushError('未指定资源')
        return false
    }

    const resourceMeta = interfaceData.resource.find(x => x.name === stage.resource)
    if (!resourceMeta) {
        pushError(`未找到资源 ${stage.resource}`)
        return false
    }

    launch.instance.resource = new maa.Resource()
    let resPaths = resourceMeta.path
    if (typeof resPaths === 'string') {
        resPaths = [resPaths]
    }
    resPaths = resPaths.map(p => p.replaceAll('{PROJECT_DIR}', projectDir))

    for (const resp of resPaths) {
        if (!(await launch.instance.resource.post_bundle(resp).wait().succeeded)) {
            pushError('资源加载失败')
            return false
        }
    }

    if (agentStatus && interfaceData.agent && interfaceData.agent.child_exec) {
        launch.status.hasAgent = true
        agentStatus.status = 'running'
        pushStatus()
        pushActiveOutput({
            type: 'agent',
            stage: stage.id
        })

        launch.instance.client = new maa.AgentClient()
        const identifier = launch.instance.client.identifier ?? 'mfg-no-identifier'

        try {
            const escapeItem = process.platform === 'win32' ? escape_win32 : escape_posix
            const cp = child_process.spawn(
                escapeItem(interfaceData.agent.child_exec.replaceAll('{PROJECT_DIR}', projectDir)),
                (interfaceData.agent.child_args ?? [])
                    .map(arg => arg.replaceAll('{PROJECT_DIR}', projectDir))
                    .concat([identifier])
                    .map(escapeItem),
                {
                    stdio: 'pipe',
                    shell: process.platform === 'win32' ? 'cmd.exe' : true,
                    cwd: projectDir,
                    env: {
                        ...process.env,
                        MFG_AGENT: '1',
                        MFG_AGENT_ROOT: projectDir,
                        MFG_AGENT_RESOURCE: resPaths.join(path.delimiter)
                    }
                }
            )

            const spawnErr = await new Promise<Error | null>(resolve => {
                cp.on('spawn', () => {
                    resolve(null)
                })
                cp.on('error', err => {
                    resolve(err)
                })
            })
            if (spawnErr) {
                throw spawnErr
            }

            cp.stdout.on('data', (chunk: Buffer) => {
                pushOutput('agent', chunk.toString())
            })
            cp.stderr.on('data', (chunk: Buffer) => {
                pushOutput('agent', chunk.toString())
            })

            launch.instance.agent = cp
        } catch (err) {
            agentStatus.status = 'failed'
            pushStatus()

            pushError(`启动Agent失败 ${err}`)
            return false
        }

        launch.instance.client.timeout = 30000
        launch.instance.client.bind_resource(launch.instance.resource)

        const connected = launch.instance.client.connect().then(
            () => true,
            () => false
        )

        if (!(await connected)) {
            agentStatus.status = 'failed'
            pushStatus()

            pushError('连接Agent失败')
            return false
        } else {
            agentStatus.status = 'succeeded'
            pushStatus()
        }
    }

    connectStatus.status = 'running'
    pushStatus()

    if (!stage.controller) {
        connectStatus.status = 'failed'
        pushStatus()

        pushError('未指定控制器')
        return false
    }

    const controllerMeta = interfaceData.controller.find(x => x.name === stage.controller)
    if (!controllerMeta) {
        connectStatus.status = 'failed'
        pushStatus()

        pushError(`未找到控制器 ${stage.controller}`)
        return false
    }

    if (controllerMeta.type === 'Adb') {
        if (!stage.adb) {
            connectStatus.status = 'failed'
            pushStatus()

            pushError('未指定设备')
            return false
        }

        if (!dev || dev.id !== stage.adb) {
            connectStatus.status = 'failed'
            pushStatus()

            pushError('未找到指定设备')
            return false
        }

        launch.instance.controller = new maa.AdbController(
            dev.adb_path,
            dev.address,
            controllerMeta.adb?.screencap ?? maa.api.AdbScreencapMethod.Default,
            controllerMeta.adb?.input ?? maa.api.AdbInputMethod.Default,
            JSON.stringify(controllerMeta.adb?.config ?? {})
        )

        const conn = launch.instance.controller.post_connection().wait().succeeded
        if (!(await conn)) {
            connectStatus.status = 'failed'
            pushStatus()

            pushError('连接失败')
            return false
        }
        if (!launch.instance.controller.connected) {
            connectStatus.status = 'failed'
            pushStatus()

            pushError('连接失败')
            return false
        }

        connectStatus.status = 'succeeded'
        pushStatus()
    } else {
        connectStatus.status = 'failed'
        pushStatus()

        pushError('暂不支持其它类型的控制器')
        return false
    }

    launch.instance.tasker = new maa.Tasker()
    launch.instance.tasker.chain_parsed_notify(notify => {
        // TODO: 弹下focus, 可以抄下mfaa的协议
        switch (notify.msg) {
            case 'Task.Started':
                pushOutput('focus', `任务开始: ${launch.instance.currentTask ?? notify.entry}`)
                break
            case 'Task.Completed':
                pushOutput('focus', `任务完成: ${launch.instance.currentTask ?? notify.entry}`)
                break
            case 'Task.Failed':
                pushOutput('focus', `任务失败: ${launch.instance.currentTask ?? notify.entry}`)
                break
            case 'NextList.Starting': {
                const focus = parseFocus(notify.focus)
                if (focus.start.length > 0) {
                    pushOutput('focus', focus.start.join('\n'))
                }
                if (focus.toast && focus.toast.length > 0) {
                    pushFocus(focus.toast)
                }
                break
            }
            case 'NextList.Succeeded': {
                const focus = parseFocus(notify.focus)
                if (focus.start.length > 0) {
                    pushOutput('focus', focus.succeeded.join('\n'))
                }
                break
            }
            case 'NextList.Failed': {
                const focus = parseFocus(notify.focus)
                if (focus.start.length > 0) {
                    pushOutput('focus', focus.failed.join('\n'))
                }
                break
            }
        }
    })
    launch.instance.tasker.bind(launch.instance.controller)
    launch.instance.tasker.bind(launch.instance.resource)

    if (!launch.instance.tasker.inited) {
        pushError('初始化失败')
        return false
    }

    return true
}

async function launchTask(task: TaskInfo) {
    if (!task.task) {
        pushError('未指定任务')
        return false
    }

    const taskMeta = interfaceData.task.find(x => x.name === task.task)
    if (!taskMeta) {
        pushError(`未找到任务 ${task.task}`)
        return false
    }

    const override: Record<string, Record<string, unknown>> = {}
    const applyOverride = (po?: unknown) => {
        if (po) {
            for (const [key, val] of Object.entries(po)) {
                override[key] = Object.assign(override[key] ?? {}, val)
            }
        }
    }

    applyOverride(taskMeta.pipeline_override)
    for (const option of taskMeta.option ?? []) {
        const optionMeta = interfaceData.option?.[option]
        if (!optionMeta) {
            pushError(`未找到选项组 ${option}`)
            return false
        }

        const val = task.option?.[option] ?? optionMeta.default_case ?? optionMeta.cases[0].name
        const caseMeta = optionMeta.cases.find(x => x.name === val)
        if (!caseMeta) {
            pushError(`未找到选项 ${val}`)
            return false
        }
        applyOverride(caseMeta.pipeline_override)
    }

    launch.instance.currentTask = task.task
    return await launch.instance.tasker?.post_task(taskMeta.entry, override).wait().succeeded
}

async function main() {
    if (!(await setupMaa())) {
        return false
    }

    interfaceData = JSON.parse(process.env['MFG_INTERFACE']!)
    launch = JSON.parse(process.env['MFG_LAUNCH']!)
    stage = JSON.parse(process.env['MFG_STAGE']!)
    projectDir = process.env['MFG_PROJECT_DIR']!
    if (process.env['MFG_DEV']) {
        dev = JSON.parse(process.env['MFG_DEV'])
    }

    return await launchStage()
}

main()
    .then(succ => {
        process.exit(succ ? 0 : 1)
    })
    .catch(err => {
        console.log(err)
        process.exit(1)
    })
