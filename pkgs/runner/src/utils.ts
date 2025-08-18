function escapeWin32(arg: string) {
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

function escapePosix(arg: string) {
    return JSON.stringify(arg) // 基本上差不多
}

export const escapeArg = process.platform === 'win32' ? escapeWin32 : escapePosix

export type FocusNotify = {
    start: string[]
    succeeded: string[]
    failed: string[]
    toast?: string
}

export function parseFocus(data: unknown): FocusNotify {
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
