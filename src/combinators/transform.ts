import type { UnknownRecord } from "type-fest"

import type { LazyParser, Parser, ParseSuccess } from "@/types"
import { run } from "@/utils"

/**
 * Creates a new parser that maps a function on the result of a parser
 */
export function map<T, U, TPayload extends UnknownRecord>(
    parser: LazyParser<T, TPayload>,
    f: (result: ParseSuccess<T, TPayload>) => U
): Parser<U, TPayload> {
    return (ctx) => {
        const result = run(parser, ctx)
        if (result.success) {
            return { ...result, value: f(result) }
        }
        return result
    }
}

/**
 * Create a new parser that result the matched text of the parser, discarding its value
 */
export function raw<TPayload extends UnknownRecord>(
    parser: LazyParser<unknown, TPayload>
): Parser<string, TPayload> {
    return (ctx) => {
        const result = run(parser, ctx)
        if (result.success) {
            return { ...result, value: ctx.source.content.slice(ctx.offset, result.next.offset) }
        }
        return result
    }
}
