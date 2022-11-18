import { LazyParser, LocationRange, ParseContext, Parser } from '@/types'
import { run } from '@/utils'

export type ParserMapFunction<T, U, P> = (
  value: T,
  loc: LocationRange,
  context: ParseContext<P>
) => U

/**
 * Creates a new parser that maps a function on the result of a parser
 */
export function map<T, U, P>(
  parser: LazyParser<T, P>,
  f: ParserMapFunction<T, U, P>
): Parser<U, P> {
  return (ctx) => {
    const result = run(parser, ctx)
    if (result.success) {
      return { ...result, value: f(result.value, result.loc, result.next) }
    }
    return result
  }
}

/**
 * Create a new parser that result the matched text of the parser, discaring its value
 */
export function raw(parser: LazyParser<unknown>): Parser<string> {
  return (ctx) => {
    const result = run(parser, ctx)
    if (result.success) {
      return { ...result, value: ctx.source.content.slice(ctx.offset, result.next.offset) }
    }
    return result
  }
}
