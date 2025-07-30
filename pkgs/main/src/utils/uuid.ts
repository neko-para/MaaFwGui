import { v4 } from 'uuid'

export function generateId<Id extends string>(): Id {
    return v4() as Id
}
