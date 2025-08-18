import { LaunchActiveOutput, RunnerMessage } from '@mfg/types'

import { launch } from './data'

function pushMessage(msg: RunnerMessage) {
    process.send?.(msg)
}

export function pushStatus() {
    pushMessage({
        type: 'updateStatus',
        status: launch.status
    })
}

export function pushError(error: string) {
    pushMessage({
        type: 'showError',
        error
    })
}

export function pushActiveOutput(output: LaunchActiveOutput) {
    pushMessage({
        type: 'setActiveOutput',
        output
    })
}

export function pushOutput(category: 'agent' | 'focus', output: string) {
    pushMessage({
        type: 'addOutput',
        category,
        output
    })
}

export function pushFocus(focus: string) {
    pushMessage({
        type: 'showFocus',
        focus
    })
}
