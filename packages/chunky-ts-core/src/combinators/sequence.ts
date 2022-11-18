import { Intersection } from '@/ts-utils'
import { LazyParser, ParseContext, Parser, ParserType, ParserValuesType } from '@/types'
import { run, success } from '@/utils'

export type MergedParser<T extends LazyParser<any>[]> = Parser<
  {
    [I in keyof T]: ParserType<T[I]>
  },
  Intersection<ParserValuesType<T[number]>> extends infer R ? { [K in keyof R]: R[K] } : never
>

export type RepeatedParser<T, P> = Parser<T[], { [K in keyof P & string]: P[K][] }>

/*
 * Creates a parser that will match when all of its parsers matches in sequence
 */
export function seq<T extends LazyParser<any>[]>(...parsers: T): MergedParser<T> {
  return ((ctx) => {
    const value = [] as any[]
    let next = ctx
    for (const parser of parsers) {
      const result = run(parser, next)
      if (result.success) {
        value.push(result.value)
        next = result.next
      } else {
        return result
      }
    }
    return success(value, [ctx.offset, next.offset], next)
  }) as MergedParser<T>
}

/*
 * Creates a parser that will try to match the same parser repeated times
 */
export function many<T, P>(
  parser: LazyParser<T, P>,
  min: number,
  max: number
): RepeatedParser<T, P> {
  type Values = ParserValuesType<RepeatedParser<T, P>>

  return (ctx) => {
    const value = [] as T[]
    let next = ctx as ParseContext<Values>
    for (let i = 0; i < max; i++) {
      const result = run(parser, next)
      if (result.success) {
        value.push(result.value)

        const values = { ...next.payload } as Values
        for (const key in result.next.payload) {
          if (!values[key]) {
            values[key] = []
          }
          values[key].push(result.next.payload[key as Extract<keyof P, string>])
        }

        next = { ...result.next, payload: values }
      } else if (value.length < min) {
        return result
      } else {
        break
      }
    }
    return success(value, [ctx.offset, next.offset], next)
  }
}

/*
 * Creates a parser that will try to match the same parser zero or more number of times
 */
export function many0<T, P>(parser: LazyParser<T, P>): RepeatedParser<T, P> {
  return many(parser, 0, Number.POSITIVE_INFINITY)
}

/*
 * Creates a parser that will try to match the same parser one or more number of times
 */
export function many1<T, P>(parser: LazyParser<T, P>): RepeatedParser<T, P> {
  return many(parser, 1, Number.POSITIVE_INFINITY)
}
