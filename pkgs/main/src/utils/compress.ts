import * as fs from 'fs/promises'
import path from 'path'
import * as tar from 'tar'
import unzipper from 'unzipper'

import { ProgressInstance } from './progress'

function throttle<Args extends unknown[]>(func: (...args: Args) => void, timeout = 200) {
    let timer: NodeJS.Timeout | null = null

    return (...args: Args) => {
        if (timer) {
            return
        }
        timer = setTimeout(() => {
            timer = null
        }, timeout)
        func(...args)
    }
}

export async function extractZip(file: string, dest: string, prog?: ProgressInstance) {
    try {
        const zip = await unzipper.Open.file(file)

        let entrySum = 0
        for (const file of zip.files) {
            entrySum += file.uncompressedSize
        }

        const update = throttle((size: number) => {
            prog?.update('解压中', (size / entrySum) * 100)
        })

        let entrySize = 0
        for (const file of zip.files) {
            const target = path.join(dest, file.path)
            if (file.type === 'File') {
                const content = await file.buffer()
                await fs.writeFile(target, content)
            } else {
                await fs.mkdir(target, { recursive: true })
            }

            entrySize += file.uncompressedSize
            update(entrySize)
        }

        prog?.update('解压中', 100)
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

export async function extractTar(file: string, dest: string, prog?: ProgressInstance) {
    try {
        let entrySum = 0
        await tar.t({
            file,
            onReadEntry: entry => {
                entrySum += entry.size
            }
        })

        const update = throttle((size: number) => {
            prog?.update('解压中', (size / entrySum) * 100)
        })

        let entrySize = 0
        await tar.x({
            file,
            cwd: dest,
            onReadEntry: entry => {
                entrySize += entry.size
                update(entrySize)
            }
        })

        prog?.update('解压中', 100)
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

export async function extractAuto(file: string, dest: string, prog?: ProgressInstance) {
    if (file.endsWith('.tar.gz') || file.endsWith('.tar') || file.endsWith('.tgz')) {
        return await extractTar(file, dest, prog)
    } else if (file.endsWith('.zip')) {
        return await extractZip(file, dest, prog)
    } else {
        console.log('unknown format', file)
        return false
    }
}
