import { generateId } from './uuid'

export type ProgressInstance = {
    update: (stage: string, progress?: number) => void
    end: () => void
}

export function makeProgress(): ProgressInstance {
    const id = generateId()

    return {
        update: (stage, progress) => {
            globalThis.renderer.utils.showProgress(id, stage, progress)
        },
        end: () => {
            globalThis.renderer.utils.endProgress(id)
        }
    }
}
