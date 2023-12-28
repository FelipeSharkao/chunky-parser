import type { ParseContext } from '@/types'

/**
 * Moves the conext position
 */
export function move(context: ParseContext, n: number): ParseContext {
  return {
    ...context,
    offset: Math.max(0, Math.min(context.offset + n, context.source.content.length)),
  }
}
