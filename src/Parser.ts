import type { ParseInput } from "@/ParseInput"
import type { ParseResult } from "@/ParseResult"

export type Parser<T> = (input: ParseInput) => ParseResult<T>

export type LazyParser<T> = (() => Parser<T>) | Parser<T>

export type ParserType<T extends LazyParser<unknown>> = T extends LazyParser<infer R> ? R : never

/**
 * Runs a parser with a context and returns its result. Useful to handle lazy parsers
 */
export function run<T>(parser: LazyParser<T>, input: ParseInput): ParseResult<T> {
    const result = parser(input)
    if (typeof result == "function") {
        return run(result, input)
    }
    return result
}
