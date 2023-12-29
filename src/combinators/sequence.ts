import type { EmptyObject, Merge, UnknownRecord } from "type-fest"

import type { LazyParser, Parser, ParserType, ParserPayloadType } from "@/types"
import { run, success } from "@/utils"

type MergedParserType<T extends readonly LazyParser<unknown, UnknownRecord>[]> = {
    -readonly [I in keyof T]: ParserType<T[I]>
}

type MergedParserPayload<T extends readonly LazyParser<unknown, UnknownRecord>[]> = T extends [
    infer R,
    ...infer RR,
]
    ? R extends LazyParser<unknown, UnknownRecord>
        ? RR extends LazyParser<unknown, UnknownRecord>[]
            ? Merge<ParserPayloadType<R>, MergedParserPayload<RR>>
            : ParserPayloadType<R>
        : EmptyObject
    : EmptyObject

export type MergedParser<T extends readonly LazyParser<unknown, UnknownRecord>[]> = Parser<
    MergedParserType<T>,
    MergedParserPayload<T>
>

export type RepeatedParser<T, P> = Parser<T[], { [K in keyof P & string]: P[K][] }>

/*
 * Creates a parser that will match when all of its parsers matches in sequence
 */
export function seq<T extends readonly LazyParser<unknown, UnknownRecord>[]>(
    ...parsers: T
): MergedParser<T> {
    return (ctx) => {
        const value: unknown[] = []
        let payload: UnknownRecord = {}
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
        return {
            ...success(value as MergedParserType<T>, [ctx.offset, next.offset], next),
            payload: payload as MergedParserPayload<T>,
        }
    }
}

/*
 * Creates a parser that will try to match the same parser repeated times
 */
export function many<T, TPayload extends UnknownRecord>(
    parser: LazyParser<T, TPayload>,
    min: number,
    max: number
): RepeatedParser<T, TPayload> {
    type Values = ParserPayloadType<RepeatedParser<T, TPayload>>

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
                    payload[key].push(result.payload[key])
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
export function many0<T, TPayload extends UnknownRecord>(
    parser: LazyParser<T, TPayload>
): RepeatedParser<T, TPayload> {
    return many(parser, 0, Number.POSITIVE_INFINITY)
}

/*
 * Creates a parser that will try to match the same parser one or more number of times
 */
export function many1<T, TPayload extends UnknownRecord>(
    parser: LazyParser<T, TPayload>
): RepeatedParser<T, TPayload> {
    return many(parser, 1, Number.POSITIVE_INFINITY)
}
