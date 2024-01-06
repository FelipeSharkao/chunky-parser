import { describe, it } from "bun:test"

import { alpha, num } from "@/parsers"
import { assertParser } from "@/utils/testing"

import { seq, many, many0, many1 } from "./sequence"

describe("seq", () => {
    it("succeedes when all the original parsers matches in sequence", () => {
        const parser = seq(num, num, alpha)
        const src = "12ab"
        assertParser(parser, src, { offset: 0 }).succeeds(3, ["1", "2", "a"])
    })

    it("fails when any of the original parsers fails", () => {
        const parser = seq(num, num, alpha)
        const src = "12ab"
        assertParser(parser, src, { offset: 1 }).fails(1, ['any character between "0" and "9"'])
    })
})

describe("many", () => {
    it("succeedes if the original parser matches N-M times in sequence", () => {
        const parser = many(num, 2, 4)
        const src = "12-345-6789"
        assertParser(parser, src, { offset: 0 }).succeeds(2, ["1", "2"])
        assertParser(parser, src, { offset: 3 }).succeeds(3, ["3", "4", "5"])
        assertParser(parser, src, { offset: 7 }).succeeds(4, ["6", "7", "8", "9"])
    })

    it("does not match more than the upper bound", () => {
        const parser = many(num, 2, 4)
        const src = "123456789"
        assertParser(parser, src, { offset: 0 }).succeeds(4, ["1", "2", "3", "4"])
    })

    it("fails it matches less than the lower bound", () => {
        const parser = many(num, 2, 4)
        const src = "12ab"
        assertParser(parser, src, { offset: 1 }).fails(1, ['any character between "0" and "9"'])
    })
})

describe("many0", () => {
    const parser = many0(num)

    it("succeedes if the original parser matches zero or more times in sequence", () => {
        const src = "a-1-23-456"
        assertParser(parser, src, { offset: 0 }).succeeds(0, [])
        assertParser(parser, src, { offset: 2 }).succeeds(1, ["1"])
        assertParser(parser, src, { offset: 4 }).succeeds(2, ["2", "3"])
        assertParser(parser, src, { offset: 7 }).succeeds(3, ["4", "5", "6"])
    })
})

describe("many1", () => {
    const parser = many1(num)

    it("succeedes if the original parser matches one or more times in sequence", () => {
        const src = "1-23-456"
        assertParser(parser, src, { offset: 0 }).succeeds(1, ["1"])
        assertParser(parser, src, { offset: 2 }).succeeds(2, ["2", "3"])
        assertParser(parser, src, { offset: 5 }).succeeds(3, ["4", "5", "6"])
    })

    it("fails it does not match once", () => {
        const src = "ab12"
        assertParser(parser, src, { offset: 0 }).fails(0, ['any character between "0" and "9"'])
    })
})
