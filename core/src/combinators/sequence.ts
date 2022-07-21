import { Parser } from '@/types'
import { success } from '@/utils'

type Inner<T extends Parser<any>[]> = {
  [I in keyof T]: T[I] extends Parser<infer R> ? R : never
}

/*
 * Creates a parser that will match when all of its parsers matches in sequence
 */
export function seq<T extends Parser<any>[]>(...parsers: T): Parser<Inner<T>> {
  return (ctx) => {
    const value = [] as any[]
    for (const parser of parsers) {
      const result = parser(ctx)
      if (result.success) {
        value.push(result.value)
        ctx = result.context
      } else {
        return result
      }
    }
    return success(ctx, value as Inner<T>)
  }
}

/*
 * Creates a parser that will try to match the same parser repeated times
 */
export function many<T>(parser: Parser<T>, min: number, max: number): Parser<T[]> {
  return (ctx) => {
    const value = [] as T[]
    for (let i = 0; i < max; i++) {
      const result = parser(ctx)
      if (result.success) {
        value.push(result.value)
        ctx = result.context
      } else if (value.length < min) {
        return result
      } else {
        break
      }
    }
    return success(ctx, value)
  }
}

/*
 * Creates a parser that will try to match the same parser zero or more number of times
 */
export function many0<T>(parser: Parser<T>): Parser<T[]> {
  return many(parser, 0, Number.POSITIVE_INFINITY)
}

/*
 * Creates a parser that will try to match the same parser one or more number of times
 */
export function many1<T>(parser: Parser<T>): Parser<T[]> {
  return many(parser, 1, Number.POSITIVE_INFINITY)
}
