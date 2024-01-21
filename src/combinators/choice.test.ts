import { describe, it, expect } from "bun:test"

import { ParseInput } from "@/ParseInput"
import { run, type Parser } from "@/Parser"
import { TokenParser } from "@/tokens"
import { expectParser } from "@/utils/testing"

import { ParserWithPrecedence, not, oneOf, optional, predicate, withPrecedence } from "./choice"
import { seq } from "./sequence"
import { map } from "./transform"

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

const num = new TokenParser("num", /\d+/)
const asterisk = new TokenParser("asterisk", "*")
const plus = new TokenParser("plus", "+")

describe("oneOf", () => {
    it("matches when any of parsers matches", () => {
        const _parser = oneOf(num, asterisk, plus)
        const input = new ParseInput("test", "*", {})
        expectParser(_parser, input).toSucceed({ value: asterisk.token("*", [0, 1]), loc: [0, 1] })
    })

    it("fails when all of the original parser fails", () => {
        const _parser = oneOf(num, asterisk, plus)
        const input = new ParseInput("test", "foo", {})
        expectParser(_parser, input).toFail({ expected: ["num", "asterisk", "plus"] })
    })
})

describe("recOneOf", () => {
    it("matches when any of parsers matches", () => {
        const _parser = withPrecedence(num, asterisk, plus)
        const input = new ParseInput("test", "*", {})
        expectParser(_parser, input).toSucceed({ value: asterisk.token("*", [0, 1]), loc: [0, 1] })
    })

    it("fails when all of the original parser fails", () => {
        const _parser = withPrecedence(num, asterisk, plus)
        const input = new ParseInput("test", "foo", {})
        expectParser(_parser, input).toFail({ expected: ["num", "asterisk", "plus"] })
    })

    it("handles order of precedence in recursive parsers", () => {
        const expr: ParserWithPrecedence<string> = withPrecedence(
            map(num, (res) => res.value.text),
            () => mul,
            () => sum
        )
        const sum: Parser<string> = map(
            seq(expr.left, plus, expr.right),
            (res) => `(${res.value[0]} + ${res.value[2]})`
        )
        const mul: Parser<string> = map(
            seq(expr.left, asterisk, expr.right),
            (res) => `(${res.value[0]} * ${res.value[2]})`
        )

        const input = new ParseInput("test", "1*2*3+4*5+6", {})
        expectParser(expr, input).toSucceed({
            value: "((((1 * 2) * 3) + (4 * 5)) + 6)",
            loc: [0, 11],
        })
    })
})
