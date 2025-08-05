import { generateId } from './uuid'

export function makeProgress() {
    const id = generateId()

    return {
        update: (stage: string, progress?: number) => {
            globalThis.renderer.utils.showProgress(id, stage, progress)
        },
        end: () => {
            globalThis.renderer.utils.endProgress(id)
        }
    }
}
