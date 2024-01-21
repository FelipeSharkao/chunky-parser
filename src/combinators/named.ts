import { run, type Parser } from "@/Parser"
import { printGroup, printGroupEnd } from "@/utils/logging"

/**
 * Creates a parser that assigned a human-readable name to `expected` in case of failure
 */
export function named<T>(name: string, parser: Parser<T>): Parser<T> {
    return (input) => {
        try {
            const offset = input.offset

            printGroup(input, "Looking for parser", JSON.stringify(name), `at ${offset}`)

            const result = run(parser, input)

            printGroupEnd(
                input,
                "Parser",
                JSON.stringify(name),
                result.success ? "FOUND" : "NOT FOUND"
            )

            if (result.success) {
                return result
            }

            result.expected.splice(0, result.expected.length, name)
            return result
        } catch (e) {
            printGroupEnd(input, "Parser", JSON.stringify(name), "FAILED")
            throw e
        }
    }
}

/**
 * Enables logging for parser `parser`. Only works if `log.enabled` of the input's context is
 * unset. If it is `true` or `false`, the value is not changed.
 */
export function log<T>(parser: Parser<T>): Parser<T> {
    return (input) => {
        if (input.context.log?.enabled !== undefined) {
            return run(parser, input)
        }

        try {
            if (!input.context.log) {
                input.context.log = {}
            }
            input.context.log.enabled = true

            printGroup(input, input.path)

            return run(parser, input)
        } finally {
            printGroupEnd(input)

            if (input.context.log) {
                input.context.log.enabled = undefined
            }
        }
    }
}

/**
 * Disable logging for the parser `parser`. Only works if `log.enabled` of the input's context is
 * `true`. If it is `false` or unset, the value is not changed. This is useful for disabling
 * logging for a parser that is called by another parser that has logging enabled.
 */
export function noLog<T>(parser: Parser<T>): Parser<T> {
    return (input) => {
        if (input.context.log?.enabled !== true) {
            return run(parser, input)
        }

        try {
            input.context.log.enabled = false
            return run(parser, input)
        } finally {
            input.context.log.enabled = true
        }
    }
}
