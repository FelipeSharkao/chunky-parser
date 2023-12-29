import type { UnknownRecord } from "type-fest"

import type { LazyParser, ParseContext, ParseResult } from "@/types"

/**
 * Runs a parser with a context and returns its result. Useful to handle lazy parsers
 */
export function run<T, TPayload extends UnknownRecord>(
    parser: LazyParser<T, TPayload>,
    context: ParseContext
): ParseResult<T, TPayload> {
    const result = parser(context)
    if (typeof result == "function") return run(parser, context)
    return result
}
