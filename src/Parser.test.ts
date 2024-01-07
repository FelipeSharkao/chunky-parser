import { describe, it, expect } from "bun:test"

import { ParseInput } from "@/ParseInput"

import { run, type Parser } from "./Parser"

describe("run", () => {
    const parser: Parser<string> = (input) => input.success({ value: "test" })
    const input = new ParseInput({ name: "test", path: "test", content: "test" }, 0, {})

    it("should run a parser", () => {
        expect(run(parser, input)).toEqual(parser(input))
    })

    it("should run a lazy parser", () => {
        const lazyParser = () => parser
        expect(run(lazyParser, input)).toEqual(parser(input))
    })
})
