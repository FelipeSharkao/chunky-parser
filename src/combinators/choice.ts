import type { EmptyObject, UnknownRecord } from "type-fest"

import type { LazyParser, Parser, ParserType, ParserPayloadType } from "@/types"
import { failure, run, success } from "@/utils"

export type OptionalParser<T, TPayload extends UnknownRecord> = Parser<
    T | undefined,
    TPayload | EmptyObject
>

export type OneOfParser<T extends LazyParser<unknown, UnknownRecord>> = Parser<
    ParserType<T>,
    ParserPayloadType<T>
>

/*
 * Creates a parser that will match `undefined` instead of failing
 */
export function optional<T, TPayload extends UnknownRecord>(
    parser: LazyParser<T, TPayload>
): OptionalParser<T, TPayload> {
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
export function predicate<T, TPayload extends UnknownRecord>(
    parser: LazyParser<T, TPayload>
): Parser<T, TPayload> {
    return (ctx) => {
        const result = run(parser, ctx)
        if (result.success) {
            return { ...result, next: { ...result.next, offset: ctx.offset } }
        }
        return result
    }
}

/*
 * Creates a parser that will succeed if the original parser fails, and will fail if the original
 * parser succeeds.
 */
export function not(parser: LazyParser<unknown, UnknownRecord>): Parser<null> {
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
 * Creates a parser that will match if any of its parsers matches. Parsers are tested in order of
 * application, matching the first to succeed
 */
export function oneOf<T extends LazyParser<unknown, UnknownRecord>[]>(
    ...parsers: T
): OneOfParser<T[number]> {
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
