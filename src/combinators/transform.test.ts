import { describe, it } from "bun:test"

import { ParseInput } from "@/ParseInput"
import { run } from "@/Parser"
import { TokenParser } from "@/tokens"
import { expectParser } from "@/utils/testing"

import { map, raw } from "./transform"

const number = new TokenParser("number", /[0-9]/)

const parser = (input: ParseInput) => {
    const result = run(number, input)
    input.context.test = "number"

    if (!result.success) {
        return result
    }

    return input.success({
        value: result.value.text,
        start: result.loc[0],
        end: result.loc[1],
    })
}

describe("map", () => {
    it("transforms the output of a parser", () => {
        const _parser = map(parser, (res) => Number(res.value))
        const input = new ParseInput("test", "12", {})
        expectParser(_parser, input).toSucceed({ value: 1, loc: [0, 1] })
        expectParser(_parser, input).toSucceed({ value: 2, loc: [1, 2] })
    })

    it("fails when the original parser fails", () => {
        const _parser = map(parser, (res) => Number(res.value))
        const input = new ParseInput("test", "a", {})
        expectParser(_parser, input).toFail({ expected: ["number"] })
    })
})

describe("raw", () => {
    it("discards the parser value and results the original text", () => {
        const _parser = raw(map(parser, (value) => Number(value)))
        const input = new ParseInput("test", "12", {})
        expectParser(_parser, input).toSucceed({ value: "1", loc: [0, 1] })
        expectParser(_parser, input).toSucceed({ value: "2", loc: [1, 2] })
    })

    it("fails when the original parser fails", () => {
        const _parser = raw(map(parser, (value) => Number(value)))
        const input = new ParseInput("test", "a", {})
        expectParser(_parser, input).toFail({ expected: ["number"] })
    })
})
