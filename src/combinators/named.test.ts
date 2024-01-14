import { describe, it } from "bun:test"

import { ParseInput } from "@/ParseInput"
import { run } from "@/Parser"
import { TokenParser } from "@/tokens"
import { expectParser } from "@/utils/testing"

import { named } from "./named"

const foo = new TokenParser("foo", "foo")

const parser = (input: ParseInput) => {
    const result = run(foo, input)
    input.context.test = "foo"

    if (!result.success) {
        return result
    }

    return input.success({
        value: result.value.text,
        start: result.loc[0],
        end: result.loc[1],
    })
}

describe("named", () => {
    const _parser = named("Named Test", parser)

    it("succeeds when the orignal parser succeeds", () => {
        const input = new ParseInput("test", "foo", {})
        expectParser(_parser, input).toSucceed({ value: "foo", loc: [0, 3] })
    })

    it("assign the name to expected when the orignal parser succeeds", () => {
        const input = new ParseInput("test", "bar", {})
        expectParser(_parser, input).toFail({ expected: ["Named Test"] })
    })
})
