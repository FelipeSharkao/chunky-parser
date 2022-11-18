import { ParseContext } from '@/types'

/**
 * Moves the conext position
 */
export function move<P>(context: ParseContext<P>, n: number): ParseContext<P> {
  return {
    ...context,
    offset: Math.max(0, Math.min(context.offset + n, context.source.content.length)),
  }
}
