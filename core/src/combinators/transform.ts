import { Parser } from '@/types'

/**
 * Creates a new parser that maps a function on the result of a parser
 */
export function map<T, U>(parser: Parser<T>, f: (value: T) => U): Parser<U> {
  return (ctx) => {
    const result = parser(ctx)
    if (result.success) {
      return { ...result, value: f(result.value) }
    }
    return result
  }
}

/**
 * Create a new parser that result the matched text of the parser, discaring its value
 */
export function raw(parser: Parser<unknown>): Parser<string> {
  return (ctx) => {
    const result = parser(ctx)
    if (result.success) {
      return { ...result, value: ctx.source.content.slice(ctx.offset, result.context.offset) }
    }
    return result
  }
}
