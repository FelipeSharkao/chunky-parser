import type { ParseInput } from "@/ParseInput"
import type { ParseResult } from "@/ParseResult"

export type Parser<T> = ParserFunction<T> | LazyParser<T>

type ParserFunction<T> = (input: ParseInput) => ParseResult<T>

type LazyParser<T> = () => Parser<T>

export type ParserType<T extends Parser<unknown>> = T extends Parser<infer R> ? R : never

/**
 * Runs a parser with a context and returns its result. Keep in mind that this makes no guarantees
 * that input won't be mutated, and a lot of parsers will mutate the input for performance reasons.
 * If you want to be able to recover the original input in case of failure, you should use `tryRun`.
 */
export function run<T>(parser: Parser<T>, input: ParseInput): ParseResult<T> {
    const result = parser(input)
    if (typeof result == "function") {
        return result(input) as ParseResult<T>
    }
    return result
}

/**
 * Runs a parser with a context and returns its result. This function will clone the input before
 * running the parser, and will update the original input only if the parser succeeds. This is
 * useful if you want to be able to recover the original input in case of failure, but it is more
 * demanding than `run`. If you don't need to recover the original input, you should use `run`.
 */
export function tryRun<T>(parser: Parser<T>, input: ParseInput): ParseResult<T> {
    const newInput = input.clone()

    let result = parser(newInput)
    if (typeof result == "function") {
        result = result(newInput) as ParseResult<T>
    }

    if (result.success) {
        input.offset = newInput.offset
        input.context = newInput.context
    }

    return result
}
