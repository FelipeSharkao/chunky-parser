import type { LazyParser, Parser, ParserType, ParserPayloadType } from '@/types'
import { run, success, type Assign, type Mutable } from '@/utils'

type MergedParserPayload<T extends readonly LazyParser<any, any>[]> = T extends [
  infer R,
  ...infer RR,
]
  ? R extends LazyParser<any, any>
    ? RR extends LazyParser<any, any>[]
      ? Assign<ParserPayloadType<R>, MergedParserPayload<RR>>
      : ParserPayloadType<R>
    : {}
  : {}

export type MergedParser<T extends readonly LazyParser<any, any>[]> = Parser<
  {
    [I in keyof T]: ParserType<T[I]>
  },
  MergedParserPayload<T>
>

export type RepeatedParser<T, P> = Parser<T[], { [K in keyof P & string]: P[K][] }>

/*
 * Creates a parser that will match when all of its parsers matches in sequence
 */
export function seq<T extends readonly LazyParser<any, any>[]>(...parsers: T): MergedParser<T> {
  return (ctx) => {
    const value = [] as unknown as Mutable<ParserType<MergedParser<T>>>
    let payload = {} as MergedParserPayload<T>
    let next = ctx
    for (const parser of parsers) {
      const result = run(parser, next)
      if (result.success) {
        value.push(result.value)
        next = result.next
        payload = { ...payload, ...result.payload }
      } else {
        return result
      }
    }
    return { ...success(value, [ctx.offset, next.offset], next), payload }
  }
}

/*
 * Creates a parser that will try to match the same parser repeated times
 */
export function many<T, P>(
  parser: LazyParser<T, P>,
  min: number,
  max: number
): RepeatedParser<T, P> {
  type Values = ParserPayloadType<RepeatedParser<T, P>>

  return (ctx) => {
    const value = [] as T[]
    const payload = {} as Values
    let next = ctx
    for (let i = 0; i < max; i++) {
      const result = run(parser, next)
      if (result.success) {
        value.push(result.value)
        next = result.next

        for (const key in result.payload) {
          if (!payload[key]) {
            payload[key] = []
          }
          payload[key].push(result.payload[key as Extract<keyof P, string>])
        }
      } else if (value.length < min) {
        return result
      } else {
        break
      }
    }
    return { ...success(value, [ctx.offset, next.offset], next), payload }
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
