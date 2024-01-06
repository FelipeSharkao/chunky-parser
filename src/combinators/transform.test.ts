import { describe, it } from "bun:test"

import { num } from "@/parsers"
import { assertParser } from "@/utils/testing"

import { map, raw } from "./transform"

describe("map", () => {
    it("transforms the output of a parser", () => {
        const parser = map(num, (res) => Number(res.value))
        const src = "12"
        assertParser(parser, src, { offset: 0 }).succeeds(1, 1)
        assertParser(parser, src, { offset: 1 }).succeeds(1, 2)
    })

    it("fails when the original parser fails", () => {
        const parser = map(num, (res) => Number(res.value))
        const src = "1a"
        assertParser(parser, src, { offset: 0 }).succeeds(1, 1)
        assertParser(parser, src, { offset: 1 }).fails(0, ['any character between "0" and "9"'])
    })
})

describe("raw", () => {
    it("discards the parser value and results the original text", () => {
        const parser = raw(map(num, (value) => Number(value)))
        const src = "12"
        assertParser(parser, src, { offset: 0 }).succeeds(1, "1")
        assertParser(parser, src, { offset: 1 }).succeeds(1, "2")
    })

    it("fails when the original parser fails", () => {
        const parser = raw(map(num, (value) => Number(value)))
        const src = "1a"
        assertParser(parser, src, { offset: 0 }).succeeds(1, "1")
        assertParser(parser, src, { offset: 1 }).fails(0, ['any character between "0" and "9"'])
    })
})
