import { describe, it } from "bun:test"

import { assertParser } from "@/utils/testing"

import { str, re, unum, ualpha, ualphanum } from "./text"

describe("str", () => {
    const parser = str("bana")

    it("matches a string literal", () => {
        const src = "banana"
        assertParser(parser, src).succeeds(4, "bana")
        assertParser(parser, src, { offset: 2 }).fails(0, ['"bana"'])
    })
})

describe("re", () => {
    const parser = re(/^bana/)

    it("matches a regex pattern", () => {
        const src = "banana banana"
        assertParser(parser, src).succeeds(4, "bana")
        assertParser(parser, src, { offset: 7 }).fails(0)
    })
})

describe("unum", () => {
    it("matches any unicode numeric character", () => {
        const src = "12ab."
        assertParser(unum, src).succeeds(1, "1")
        assertParser(unum, src, { offset: 1 }).succeeds(1, "2")
        assertParser(unum, src, { offset: 2 }).fails()
        assertParser(unum, src, { offset: 3 }).fails()
        assertParser(unum, src, { offset: 4 }).fails()
        assertParser(unum, src, { offset: 5 }).fails()
    })
})

describe("ualpha", () => {
    it("matches any unicode alphabetic character", () => {
        const src = "ab12."
        assertParser(ualpha, src).succeeds(1, "a")
        assertParser(ualpha, src, { offset: 1 }).succeeds(1, "b")
        assertParser(ualpha, src, { offset: 2 }).fails()
        assertParser(ualpha, src, { offset: 3 }).fails()
        assertParser(ualpha, src, { offset: 4 }).fails()
        assertParser(ualpha, src, { offset: 5 }).fails()
    })
})

describe("ualphanum", () => {
    it("matches any unicode alphanumeric character", () => {
        const src = "12ab."
        assertParser(unum, src).succeeds(1, "1")
        assertParser(unum, src, { offset: 1 }).succeeds(1, "2")
        assertParser(ualpha, src, { offset: 2 }).succeeds(1, "a")
        assertParser(ualpha, src, { offset: 3 }).succeeds(1, "b")
        assertParser(ualphanum, src, { offset: 4 }).fails()
        assertParser(ualphanum, src, { offset: 5 }).fails()
    })
})
