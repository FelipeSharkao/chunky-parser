import { describe, it } from "bun:test"

import { assertParser } from "@/utils/testing"

import { any, anyOf, anyIn, num, alpha, alphanum } from "./char"

describe("any", () => {
    it("matches any character", () => {
        const src = "ab12."
        assertParser(any, src).succeeds(1, "a")
        assertParser(any, src, { offset: 1 }).succeeds(1, "b")
        assertParser(any, src, { offset: 2 }).succeeds(1, "1")
        assertParser(any, src, { offset: 3 }).succeeds(1, "2")
        assertParser(any, src, { offset: 4 }).succeeds(1, ".")
        assertParser(any, src, { offset: 5 }).fails(0, ["any character"])
    })
})

describe("anyOf", () => {
    const parser = anyOf("abc")

    it("matches any of the given characters", () => {
        const src = "abra cadabra"
        assertParser(parser, src).succeeds(1, "a")
        assertParser(parser, src, { offset: 1 }).succeeds(1, "b")
        assertParser(parser, src, { offset: 2 }).fails(0, ['"a"', '"b"', '"c"'])
        assertParser(parser, src, { offset: 5 }).succeeds(1, "c")
        assertParser(parser, src, { offset: 6 }).succeeds(1, "a")
        assertParser(parser, src, { offset: 7 }).fails(0, ['"a"', '"b"', '"c"'])
    })
})

describe("anyIn", () => {
    it("matches any in the given range of characters", () => {
        let parser = anyIn("am")

        const src = "ab12."
        assertParser(parser, src).succeeds(1, "a")
        assertParser(parser, src, { offset: 1 }).succeeds(1, "b")
        assertParser(parser, src, { offset: 2 }).fails(0, ['any character between "a" and "m"'])

        parser = anyIn("09")

        assertParser(parser, src, { offset: 2 }).succeeds(1, "1")
        assertParser(parser, src, { offset: 3 }).succeeds(1, "2")
        assertParser(parser, src, { offset: 4 }).fails(0, ['any character between "0" and "9"'])
    })
})

describe("num", () => {
    it("matches any ASCII numeric character", () => {
        const src = "12ab."
        assertParser(num, src).succeeds(1, "1")
        assertParser(num, src, { offset: 1 }).succeeds(1, "2")
        assertParser(num, src, { offset: 2 }).fails(0, ['any character between "0" and "9"'])
        assertParser(num, src, { offset: 3 }).fails(0, ['any character between "0" and "9"'])
        assertParser(num, src, { offset: 4 }).fails(0, ['any character between "0" and "9"'])
        assertParser(num, src, { offset: 5 }).fails(0, ['any character between "0" and "9"'])
    })
})

describe("alpha", () => {
    it("matches any ASCII alphabetic character", () => {
        const src = "ab12."
        assertParser(alpha, src).succeeds(1, "a")
        assertParser(alpha, src, { offset: 1 }).succeeds(1, "b")
        assertParser(alpha, src, { offset: 2 }).fails(0, [
            'any character between "A" and "Z"',
            'any character between "a" and "z"',
        ])
        assertParser(alpha, src, { offset: 3 }).fails(0, [
            'any character between "A" and "Z"',
            'any character between "a" and "z"',
        ])
        assertParser(alpha, src, { offset: 4 }).fails(0, [
            'any character between "A" and "Z"',
            'any character between "a" and "z"',
        ])
        assertParser(alpha, src, { offset: 5 }).fails(0, [
            'any character between "A" and "Z"',
            'any character between "a" and "z"',
        ])
    })
})

describe("alphanum", () => {
    it("matches any ASCII alphanumeric character", () => {
        const src = "ab12."
        assertParser(alphanum, src).succeeds(1, "a")
        assertParser(alphanum, src, { offset: 1 }).succeeds(1, "b")
        assertParser(alphanum, src, { offset: 2 }).succeeds(1, "1")
        assertParser(alphanum, src, { offset: 3 }).succeeds(1, "2")
        assertParser(alphanum, src, { offset: 4 }).fails(0, [
            'any character between "0" and "9"',
            'any character between "A" and "Z"',
            'any character between "a" and "z"',
        ])
        assertParser(alphanum, src, { offset: 5 }).fails(0, [
            'any character between "0" and "9"',
            'any character between "A" and "Z"',
            'any character between "a" and "z"',
        ])
    })
})
