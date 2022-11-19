import { LazyParser, Parser, ParserType, ParserPayloadType } from '@/types'
import { failure, run, success } from '@/utils'

export type OptionalParser<T, P> = Parser<T | undefined, { [K in keyof P]?: P[K] | undefined }>
export type OneOfParser<T extends LazyParser<any, any>> = Parser<
  ParserType<T>,
  ParserPayloadType<T>
>

/*
 * Creates a parser that will match `undefined` instead of failing
 */
export function optional<T, P>(parser: LazyParser<T, P>): OptionalParser<T, P> {
  return (ctx) => {
    const result = run(parser, ctx)
    if (!result.success) {
      return success(undefined, [ctx.offset, ctx.offset], ctx)
    }
    return result
  }
}

/*
 * Creates a parser that will never consume any text
 */
export function predicate<T, P>(parser: LazyParser<T, P>): Parser<T, P> {
  return (ctx) => {
    const result = run(parser, ctx)
    if (result.success) {
      return { ...result, next: { ...result.next, offset: ctx.offset } }
    }
    return result
  }
}

/*
 * Creates a parser that will succeede if the original parser fails,
 * and will fail if the original parser succeedes.
 */
export function not(parser: LazyParser<any, any>): Parser<null> {
  return (ctx) => {
    const result = run(parser, ctx)
    if (result.success) {
      return failure(ctx, [])
    } else {
      return success(null, [ctx.offset, ctx.offset], ctx)
    }
  }
}

/*
 * Creates a parser that will match if any of its parsers mathes.
 * Parsers are tested in order of application, matching the first to succeede
 */
export function oneOf<T extends LazyParser<any, any>[]>(...parsers: T): OneOfParser<T[number]> {
  return (ctx) => {
    const expected = [] as string[]
    for (const parser of parsers) {
      const result = run(parser as OneOfParser<T[number]>, ctx)
      if (result.success) {
        return result
      } else {
        expected.push(...result.expected)
      }
    }
    return failure(ctx, expected)
  }
}
