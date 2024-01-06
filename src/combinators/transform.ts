import type { ParseSuccess } from "@/ParseResult"
import { run, type LazyParser, type Parser } from "@/Parser"

/**
 * Creates a new parser that maps a function on the result of a parser
 */
export function map<T, U>(parser: LazyParser<T>, f: (result: ParseSuccess<T>) => U): Parser<U> {
    return (input) => {
        const result = run(parser, input)
        if (result.success) {
            return { ...result, value: f(result) }
        }
        return result
    }
}

/**
 * Create a new parser that result the matched text of the parser, discarding its value
 */
export function raw(parser: LazyParser<unknown>): Parser<string> {
    return (input) => {
        const result = run(parser, input)
        if (result.success) {
            return { ...result, value: input.source.content.slice(...result.loc) }
        }
        return result
    }
}
