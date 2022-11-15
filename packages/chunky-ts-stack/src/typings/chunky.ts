import '@chunky/core'

import { StackMap } from '@/types'

declare module '@chunky/core' {
  export interface ParseContext {
    stacks?: StackMap
  }
}
