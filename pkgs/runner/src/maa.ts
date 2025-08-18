import { MaaLoader, MaaLoaderOption, maa, setMaa } from '@mfg/maa'

export async function setupMaa() {
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
