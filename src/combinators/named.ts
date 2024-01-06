import { run, type LazyParser, type Parser } from "@/Parser"

/**
 * Creates a parser that assigned a human-readable name to `expected` in case of failure
 */
export function named<T>(name: string, parser: LazyParser<T>): Parser<T> {
    return (input) => {
        const result = run(parser, input)
        if (result.success) return result
        return { ...result, expected: [name] }
    }
}
