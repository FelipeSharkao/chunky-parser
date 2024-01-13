import { it, describe } from "bun:test"

import { ParseInput } from "@/ParseInput"
import { tokens } from "@/tokens"
import { expectParser } from "@/utils/testing"

const tk = tokens({
    banana: { pattern: "banana" },
    number: { pattern: /\d+/ },
})

describe("tokens", () => {
    it("matches a string literal", () => {
        const input = new ParseInput("test", "banana", {})
        expectParser(tk.banana, input).toSucceed({
            value: tk.banana.token("banana", [0, 6]),
            loc: [0, 6],
        })
        expectParser(tk.banana, input).toFail({ expected: ["banana"], offset: 6 })
    })

    it("matches a regex pattern", () => {
        const input = new ParseInput("test", "123", {})
        expectParser(tk.number, input).toSucceed({
            value: tk.number.token("123", [0, 3]),
            loc: [0, 3],
        })
        expectParser(tk.number, input).toFail({ expected: ["number"], offset: 3 })
    })
})
