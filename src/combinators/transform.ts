import type { ParseInput } from "@/ParseInput"
import type { ParseResult, ParseSuccess } from "@/ParseResult"
import { run, type Parser } from "@/Parser"

/**
 * Creates a new parser that maps a function on the result of a parser
 */
export function map<T, U>(
    parser: Parser<T>,
    f: (result: ParseSuccess<T>, input: ParseInput) => U
): Parser<U> {
    return (input) => {
        const result = run<T | U>(parser, input)
        if (result.success) {
            result.value = f(result as ParseSuccess<T>, input)
        }
        return result as ParseResult<U>
    }
}

/**
 * Create a new parser that result the matched text of the parser, discarding its value
 */
export function raw(parser: Parser<unknown>): Parser<string> {
    return (input) => {
        const result = run(parser, input)
        if (result.success) {
            result.value = input.source.content.slice(result.loc[0], result.loc[1])
        }
        return result as ParseResult<string>
    }
}
