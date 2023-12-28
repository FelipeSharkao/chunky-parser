import type { LazyParser, Parser, ParseSuccess } from '@/types'
import { run } from '@/utils'

/**
 * Creates a new parser that maps a function on the result of a parser
 */
export function map<T, U, P>(
  parser: LazyParser<T, P>,
  f: (result: ParseSuccess<T, P>) => U
): Parser<U, P> {
  return (ctx) => {
    const result = run(parser, ctx)
    if (result.success) {
      return { ...result, value: f(result) }
    }
    return result
  }
}

/**
 * Create a new parser that result the matched text of the parser, discaring its value
 */
export function raw<P>(parser: LazyParser<unknown, P>): Parser<string, P> {
  return (ctx) => {
    const result = run(parser, ctx)
    if (result.success) {
      return { ...result, value: ctx.source.content.slice(ctx.offset, result.next.offset) }
    }
    return result
  }
}
