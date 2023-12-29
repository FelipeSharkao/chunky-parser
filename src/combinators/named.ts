import type { Merge, UnknownRecord } from "type-fest"

import type { LazyParser, Parser } from "@/types"
import { run } from "@/utils"

/**
 * Creates a parser that assigned a human-readable name to `expected` in case of failure
 */
export function named<T>(name: string, parser: LazyParser<T>): Parser<T> {
    return (ctx) => {
        const result = run(parser, ctx)
        if (result.success) return result
        return { ...result, expected: Array.from(new Set([...result.expected, name])) }
    }
}

/**
 * Bind the parser resulting value to a key in the payload
 */
export function label<T, TPayload extends UnknownRecord, K extends PropertyKey>(
    key: K,
    parser: LazyParser<T, TPayload>
): Parser<T, Merge<TPayload, Record<K, T>>> {
    return (ctx) => {
        const result = run(parser, ctx)
        if (!result.success) return result
        const payload = { ...result.payload, [key]: result.value } as Merge<TPayload, Record<K, T>>
        return { ...result, payload }
    }
}

/**
 * Creates a parser that merges a predefined value to the payload
 */
export function set<T, TPayload extends UnknownRecord, TValue>(
    parser: LazyParser<T, TPayload>,
    value: TValue
): Parser<T, Merge<TPayload, TValue>> {
    return (ctx) => {
        const result = run(parser, ctx)
        if (!result.success) return result
        const payload = { ...result.payload, ...value } as Merge<TPayload, TValue>
        return { ...result, payload }
    }
}
