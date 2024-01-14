import { run, type Parser } from "@/Parser"

/**
 * Creates a parser that assigned a human-readable name to `expected` in case of failure
 */
export function named<T>(name: string, parser: Parser<T>): Parser<T> {
    return (input) => {
        try {
            const result = run(parser, input)

            if (input.context.options?.log) {
                console.log(
                    "[LOG] Looking for parser",
                    JSON.stringify(name),
                    `at ${input.offset}:`,
                    result.success ? "FOUND" : "NOT FOUND"
                )
            }

            if (result.success) {
                return result
            }

            result.expected.splice(0, result.expected.length, name)
            return result
        } catch (e) {
            if (input.context.options?.log) {
                console.log(
                    "[LOG] Looking for parser",
                    JSON.stringify(name),
                    `at ${input.offset}:`,
                    "ERROR"
                )
            }
            throw e
        }
    }
}

/**
 * Enables logging for parser `parser`
 */
export function log<T>(parser: Parser<T>): Parser<T> {
    return (input) => {
        if (input.context.options?.log) {
            return run(parser, input)
        }

        try {
            console.log("[LOG]", input.path)

            if (!input.context.options) {
                input.context.options = {}
            }
            input.context.options.log = true

            return run(parser, input)
        } finally {
            console.log("[LOG] Logging disabled")
            console.log()

            if (input.context.options) {
                input.context.options.log = false
            }
        }
    }
}
