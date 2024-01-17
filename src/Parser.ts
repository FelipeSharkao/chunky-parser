import type { ParseInput } from "@/ParseInput"
import type { ParseResult } from "@/ParseResult"

import { printGroup, printGroupEnd } from "./utils/logging"

export type Parser<T> = ParserFunction<T> | LazyParser<T> | ParserClass<T>

type ParserFunction<T> = (input: ParseInput) => ParseResult<T>

type LazyParser<T> = () => Parser<T>

export interface ParserClass<T> {
    parse(input: ParseInput): ParseResult<T>
}

export type ParserType<T extends Parser<unknown>> = T extends Parser<infer R> ? R : never

/**
 * Runs a parser with a input and returns its result. The input and its context won't be mutated. If
 * the parser fails, this function will throw an error with information about the failure.
 */
export function parse<T>(parser: Parser<T>, input: ParseInput) {
    printGroup(input, input.path)

    try {
        const result = run(parser, input.clone())
        if (result.success) {
            return result.value
        }

        let message = `Parsing error\nAt ${input.path}:${result.offset}\n    Unexpected input.`

        if (result.expected.length === 1) {
            message += `    Unexpected input. Expected ${result.expected[0]}`
        } else if (result.expected.length > 1) {
            message += `    Unexpected input. Expected one of: ${result.expected.join(", ")}`
        }

        throw new Error(message)
    } finally {
        printGroupEnd(input)
    }
}

/**
 * Runs a parser with a context and returns its result. Keep in mind that this makes no guarantees
 * that input won't be mutated, and a lot of parsers will mutate the input for performance reasons.
 * If you want to be able to recover the original input in case of failure, you should use `tryRun`.
 */
export function run<T>(parser: Parser<T>, input: ParseInput): ParseResult<T> {
    let result: ParseResult<T>
    if (typeof parser == "function") {
        let lazyResult = parser(input)
        if (typeof lazyResult == "function") {
            lazyResult = lazyResult(input)
        }
        result = lazyResult as ParseResult<T>
    } else {
        result = parser.parse(input)
    }

    input.offset = result.success ? result.loc[1] : result.offset
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

    let result: ParseResult<T>
    if (typeof parser == "function") {
        let lazyResult = parser(newInput)
        if (typeof lazyResult == "function") {
            lazyResult = lazyResult(newInput)
        }
        result = lazyResult as ParseResult<T>
    } else {
        result = parser.parse(newInput)
    }

    if (result.success) {
        input.offset = result.loc[1]
        input.context = newInput.context
    }

    return result
}
