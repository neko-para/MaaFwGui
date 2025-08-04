import * as tar from 'tar'
import unzipper from 'unzipper'

export async function extractZip(file: string, dest: string) {
    try {
        const zip = await unzipper.Open.file(file)
        await zip.extract({
            path: dest
        })
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

export async function extractTar(file: string, dest: string) {
    try {
        await tar.x({
            file,
            cwd: dest
        })
        return true
    } catch (err) {
        console.log(err)
        return false
    }
}

export async function extractAuto(file: string, dest: string) {
    if (file.endsWith('.tar.gz') || file.endsWith('.tar') || file.endsWith('.tgz')) {
        return await extractTar(file, dest)
    } else if (file.endsWith('.zip')) {
        return await extractZip(file, dest)
    } else {
        console.log('unknown format', file)
        return false
    }
}
