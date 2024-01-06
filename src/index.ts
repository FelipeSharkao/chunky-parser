import { ParseInput, type ParseContext } from "@/ParseInput"
import type { Parser } from "@/Parser"
import type { Source } from "@/Source"

export * from "@/combinators"
export * from "@/ParseInput"
export * from "@/ParseResult"
export * from "@/Parser"
export * from "@/parsers"
export * from "@/Source"

export function parse<T>(parser: Parser<T>, source: Source, context: ParseContext): T {
    const result = parser(new ParseInput(source, 0, context))
    if (result.success) {
        return result.value
    }
    throw new Error(
        "Parsing error\n\n" +
            `At ${result.source.path}:${result.offset}\n` +
            (result.expected.length === 0
                ? "    Unexpected input."
                : `    Unexpected input. Expected one of: ${result.expected.join(", ")}`)
    )
}
