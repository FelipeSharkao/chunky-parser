import { LazyParser, Parser, ParserValuesType } from '@/types'
import { run } from '@/utils'

/**
 * Creates a parser that assigned a human-readable name to `expected` in case of failure
 */
export function named<T>(name: string, parser: Parser<T>): Parser<T> {
  return (ctx) => {
    const result = parser(ctx)
    if (result.success) return result
    return { ...result, expected: Array.from(new Set([...result.expected, name])) }
  }
}

/**
 * Bind the parser resulting value to a key in the payload
 */
export function label<T, P, K extends string>(
  key: K,
  parser: Parser<T, P>
): Parser<T, P & { [k in K]: T }> {
  return (ctx) => {
    const result = parser(ctx)
    if (!result.success) return result
    const payload = {
      ...ctx.payload,
      ...result.next.payload,
      [key as K]: result.value,
    } as P & Record<K, T>
    return { ...result, next: { ...result.next, payload } }
  }
}

/**
 * Creates a parser that merges a pradefined value to the payload
 */
export function set<T, P, V>(value: V, parser: LazyParser<T, P>): Parser<T, P & V> {
  return (ctx) => {
    const result = run(parser, ctx)
    if (!result.success) return result
    const payload = { ...result.next.payload, ...value }
    return { ...result, next: { ...result.next, payload } }
  }
}
