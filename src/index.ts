import { ParseInput } from "@/ParseInput"
import { run, type Parser } from "@/Parser"

export * from "@/combinators"
export * from "@/ParseInput"
export * from "@/ParseResult"
export * from "@/Parser"
export { tokens } from "@/tokens"

export function parse<T>(parser: Parser<T>, input: ParseInput) {
    const result = run(parser, input)
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
}
