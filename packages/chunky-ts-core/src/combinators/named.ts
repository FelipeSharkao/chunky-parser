import { Parser } from '@/types'

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
