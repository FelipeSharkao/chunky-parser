import '@chunky/core'

declare module '@chunky/core' {
  export interface ParseContext {
    stacks?: Record<string, string[]>
  }
}
