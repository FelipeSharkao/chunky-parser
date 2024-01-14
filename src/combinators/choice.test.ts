import { describe, it, expect } from "bun:test"

import { ParseInput } from "@/ParseInput"
import { run } from "@/Parser"
import { TokenParser } from "@/tokens"
import { expectParser } from "@/utils/testing"

import { not, oneOf, optional, predicate } from "./choice"

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

describe("optional", () => {
    it("results null instead of failing", () => {
        const input = new ParseInput("test", "foo", {})
        expectParser(optional(parser), input).toSucceed({ value: "foo", loc: [0, 3] })
        expectParser(optional(parser), input).toSucceed({ value: null, loc: [3, 3] })
    })
})

describe("predicate", () => {
    it("matches without moving the offset", () => {
        const input = new ParseInput("test", "foo", {})
        run(predicate(parser), input)
        expect(input.offset).toBe(0)
    })

    it("fails when the original parser fails", () => {
        const input = new ParseInput("test", "bar", {})
        expectParser(parser, input).toFail({ expected: ["foo"] })
    })
})

describe("not", () => {
    it("fails when the original parser succeede", () => {
        const input = new ParseInput("test", "foo", {})
        expectParser(not(parser), input).toFail({ expected: [] })
    })

    it("succeede when the original parser fails", () => {
        const input = new ParseInput("test", "bar", {})
        expectParser(not(parser), input).toSucceed({ value: null, loc: [0, 0] })
    })
})

describe("oneOf", () => {
    it("matches when any of parsers matches", () => {
        const _parser = oneOf(not(parser), parser)
        const input = new ParseInput("test", "foo", {})
        expectParser(_parser, input).toSucceed({ value: "foo", loc: [0, 3] })
    })

    it("fails when all of the original parser fails", () => {
        const _parser = oneOf(not(parser), not(parser))
        const input = new ParseInput("test", "foo", {})
        expectParser(_parser, input).toFail({ expected: [] })
    })
})
