export type ResourceId = string & { __brand: 'ResourceId' }

export type ResourceManageType = 'external' | 'managed'

export type ResourceInfo = {
    id: ResourceId

    name: string

    type: ResourceManageType
    path: string
}
