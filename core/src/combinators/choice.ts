import { Parser } from '@/types'
import { failure, success } from '@/utils'

/*
 * Creates a parser that will match `null` instead of failing
 */
export function optional<T>(parser: Parser<T>): Parser<T | null> {
  return (ctx) => {
    const result = parser(ctx)
    if (!result.success) {
      return success(ctx, null)
    }
    return result
  }
}

/*
 * Creates a parser that will never consume any text
 */
export function predicate<T>(parser: Parser<T>): Parser<T> {
  return (ctx) => {
    const result = parser(ctx)
    if (result.success) {
      return { ...result, context: ctx }
    }
    return result
  }
}

/*
 * Creates a parser that will succeede if the original parser fails,
 * and will fail if the original parser succeedes.
 */
export function not<T>(parser: Parser<T>): Parser<null> {
  return (ctx) => {
    const result = parser(ctx)
    if (result.success) {
      return failure(ctx, [])
    } else {
      return success(ctx, null)
    }
  }
}

/*
 * Creates a parser that will match if any of its parsers mathes.
 * Parsers are tested in order of application, matching the first to succeede
 */
export function oneOf<T>(...parsers: Parser<T>[]): Parser<T> {
  return (ctx) => {
    const expected = [] as string[]
    for (const parser of parsers) {
      const result = parser(ctx)
      if (result.success) {
        return result
      } else {
        expected.push(...result.expected)
      }
    }
    return failure(ctx, expected)
  }
}
