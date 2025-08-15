import type { LaunchActiveOutput, LaunchStatus } from './launch'

export type RunnerMessage =
    | {
          type: 'updateStatus'
          status: LaunchStatus
      }
    | {
          type: 'showError'
          error: string
      }
    | {
          type: 'setActiveOutput'
          output: LaunchActiveOutput
      }
    | {
          type: 'addOutput'
          category: 'agent' | 'focus'
          output: string
      }
    | {
          type: 'showFocus'
          focus: string
      }
