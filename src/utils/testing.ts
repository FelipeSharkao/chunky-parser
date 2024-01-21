import { expect } from "bun:test"

import type { ParseInput } from "@/ParseInput"
import type { LocationRange } from "@/ParseResult"
import { run, type Parser } from "@/Parser"

export function expectParser<T>(parser: Parser<T>, input: ParseInput) {
    const result = run(parser, input)

    return {
        toSucceed(args: { value: T; loc: LocationRange }) {
            expect(
                result.success ? { success: true, value: result.value, loc: result.loc } : result
            ).toEqual({ success: true, ...args })
        },
        toFail(args: { expected: string[]; offset?: number }) {
            expect(
                !result.success
                    ? { success: false, expected: new Set(result.expected), offset: result.offset }
                    : result
            ).toEqual({
                success: false,
                offset: args.offset ?? 0,
                expected: new Set(args.expected),
            })
        },
    }
}
