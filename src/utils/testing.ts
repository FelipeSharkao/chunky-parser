import { strict as assert } from "node:assert"
import { inspect } from "node:util"

import { ParseInput, type ParseContext } from "@/ParseInput"
import { run, type Parser } from "@/Parser"

type AssertParserArgs = {
    offset?: number
    context?: ParseContext
}

export function assertParser<T>(parser: Parser<T>, content: string, args: AssertParserArgs = {}) {
    const input = new ParseInput(
        { path: "anonymous", content },
        args.offset || 0,
        args.context || {}
    )
    const result = run(parser, input)

    return {
        succeeds(length: number, value: T): ParseContext {
            assert.ok(
                result.success,
                `Expect parser to succeed with value ${inspect(value)}, it failed instead`
            )

            const actualLength = result.loc[1] - result.loc[0]
            assert.equal(
                actualLength,
                length,
                `Expected parser to match ${length} characters, it matched ${actualLength} instead.`
            )

            assert.deepEqual(result.value, value)

            return input.context
        },
        fails(after = 0, reason: string[] = []): ParseContext {
            assert.ok(!result.success, "Expect parser to fail, it succeeded instead")

            assert.deepEqual(
                {
                    success: false,
                    offset: result.offset,
                    expected: new Set(result.expected),
                },
                {
                    success: false,
                    offset: (args.offset || 0) + after,
                    expected: new Set(reason),
                }
            )

            return input.context
        },
    }
}
