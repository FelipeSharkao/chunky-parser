import { LazyParser, Parser, ParserType } from '@/types'
import { failure, run, success } from '@/utils'

/*
 * Creates a parser that will match `null` instead of failing
 */
export function optional<T>(parser: LazyParser<T>): Parser<T | null> {
  return (ctx) => {
    const result = run(parser, ctx)
    if (!result.success) {
      return success(null, [ctx.offset, ctx.offset], ctx)
    }
    return result
  }
}

/*
 * Creates a parser that will never consume any text
 */
export function predicate<T>(parser: LazyParser<T>): Parser<T> {
  return (ctx) => {
    const result = run(parser, ctx)
    if (result.success) {
      return { ...result, next: ctx }
    }
    return result
  }
}

/*
 * Creates a parser that will succeede if the original parser fails,
 * and will fail if the original parser succeedes.
 */
export function not<T>(parser: LazyParser<T>): Parser<null> {
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
export function oneOf<T extends LazyParser<any>[]>(...parsers: T): Parser<ParserType<T[number]>> {
  return (ctx) => {
    const expected = [] as string[]
    for (const parser of parsers) {
      const result = run(parser, ctx)
      if (result.success) {
        return result
      } else {
        expected.push(...result.expected)
      }
    }
    return failure(ctx, expected)
  }
}
