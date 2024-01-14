import { describe, it } from "bun:test"

import { ParseInput } from "@/ParseInput"
import { run } from "@/Parser"
import { TokenParser } from "@/tokens"
import { expectParser } from "@/utils/testing"

import { seq, many } from "./sequence"

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

describe("seq", () => {
    it("succeedes when all the original parsers matches in sequence", () => {
        const _parser = seq(parser, parser, parser)
        const input = new ParseInput("test", "foofoofoo", {})
        expectParser(_parser, input).toSucceed({ value: ["foo", "foo", "foo"], loc: [0, 9] })
    })

    it("fails when any of the original parsers fails", () => {
        const _parser = seq(parser, parser, parser)
        const input = new ParseInput("test", "foofoobar", {})
        expectParser(_parser, input).toFail({ expected: ["foo"], offset: 6 })
    })
})

describe("many", () => {
    it("succeedes if the original parser matches N-M times in sequence", () => {
        const _parser = many(parser, 2, 4)
        const input = new ParseInput("test", "foofoofoo", {})
        expectParser(_parser, input).toSucceed({ value: ["foo", "foo", "foo"], loc: [0, 9] })
    })

    it("does not match more than the upper bound", () => {
        const _parser = many(parser, 1, 2)
        const input = new ParseInput("test", "foofoofoo", {})
        expectParser(_parser, input).toSucceed({ value: ["foo", "foo"], loc: [0, 6] })
    })

    it("fails it matches less than the lower bound", () => {
        const _parser = many(parser, 2, 4)
        const input = new ParseInput("test", "foo", {})
        expectParser(_parser, input).toFail({ expected: ["foo"], offset: 3 })
    })
})
