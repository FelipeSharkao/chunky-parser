import { it, describe } from "bun:test"

import { ParseInput } from "@/ParseInput"
import { TokenParser } from "@/tokens"
import { expectParser } from "@/utils/testing"

const banana = new TokenParser("banana", "banana")
const number = new TokenParser("number", /\d+/)

describe("TokenParser", () => {
    it("matches a string literal", () => {
        const input = new ParseInput("test", "banana", {})
        expectParser(banana, input).toSucceed({
            value: banana.token("banana", [0, 6]),
            loc: [0, 6],
        })
        expectParser(banana, input).toFail({ expected: ["banana"], offset: 6 })
    })

    it("matches a regex pattern", () => {
        const input = new ParseInput("test", "123", {})
        expectParser(number, input).toSucceed({
            value: number.token("123", [0, 3]),
            loc: [0, 3],
        })
        expectParser(number, input).toFail({ expected: ["number"], offset: 3 })
    })
})
