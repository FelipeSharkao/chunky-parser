import { run, type Parser } from "@/Parser"

/**
 * Creates a parser that assigned a human-readable name to `expected` in case of failure
 */
export function named<T>(name: string, parser: Parser<T>): Parser<T> {
    return (input) => {
        const result = run(parser, input)
        if (result.success) {
            return result
        }

        result.expected.splice(0, result.expected.length, name)
        return result
    }
}
