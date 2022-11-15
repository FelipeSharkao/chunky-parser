import { LazyParser, LocationRange, Parser, Source } from '@/types'
import { run } from '@/utils'

export type ParserMapFunction<T, U> = (value: T, loc: LocationRange, source: Source) => U

/**
 * Creates a new parser that maps a function on the result of a parser
 */
export function map<T, U>(parser: LazyParser<T>, f: ParserMapFunction<T, U>): Parser<U> {
  return (ctx) => {
    const result = run(parser, ctx)
    if (result.success) {
      return { ...result, value: f(result.value, result.loc, ctx.source) }
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
