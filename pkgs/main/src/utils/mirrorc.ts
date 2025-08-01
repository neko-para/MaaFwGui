import axios from 'axios'

export type MirrorChyanReleaseData = {
    version_name: string
    version_number: number
    url?: string
    filesize?: number
    sha256?: string
    update_type?: 'incremental' | 'full'
    os: string
    arch: string
    channel: 'stable' | 'beta' | 'alpha'
    release_note: string
    custom_data?: unknown
    cdk_expired_time?: number
}

const errorMap = {
    1001: 'invalid_params',
    7001: 'cdk_expired',
    7002: 'cdk_invalid',
    7003: 'resource_quota_exhausted',
    7004: 'key_mismatch',
    7005: 'key_blocked',
    8001: 'resource_not_found',
    8002: 'invalid_os',
    8003: 'invalid_arch'
} as const

export type MirrorChyanError = (typeof errorMap)[keyof typeof errorMap]

export const mirrorcErrorMsg: Record<MirrorChyanError, string> = {
    invalid_params: '参数错误',
    cdk_expired: 'CDK已过期',
    cdk_invalid: 'CDK无效',
    resource_quota_exhausted: 'CDK已达今日使用上限',
    key_mismatch: 'CDK类型错误',
    key_blocked: 'CDK已被封禁',
    resource_not_found: '无法找到对应资源',
    invalid_os: '操作系统错误',
    invalid_arch: '架构错误'
}

export async function mirrorcRequest(
    rid: string,
    cdk?: string
): Promise<MirrorChyanReleaseData | MirrorChyanError | null> {
    const resp = await axios({
        url: `https://mirrorchyan.com/api/resources/${rid}/latest`,
        params: {
            cdk,
            user_agent: 'MaaFwGui',
            os: process.platform,
            arch: process.arch
        },
        responseType: 'json',
        validateStatus: () => true
    })
    const data = resp.data as {
        code: number
        msg: string
        data: MirrorChyanReleaseData
    }
    if (data.code === 0) {
        return data.data
    } else if (data.code in errorMap) {
        return errorMap[data.code as keyof typeof errorMap]
    } else if (data.code === 1) {
        // undivided
        console.log(data.msg)
        return null
    } else if (data.code < 0) {
        // fatal error
        console.log(data)
        return null
    } else if (data.code > 0) {
        // unknown error
        console.log(data)
        return null
    } else {
        // wtf
        return null
    }
}
