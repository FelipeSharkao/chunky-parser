import { describe, it, expect } from "bun:test"

import { ParseInput } from "@/ParseInput"

import { run, tryRun } from "./Parser"

const parser = (input: ParseInput) => {
    input.context.test = "test"
    return input.success({ value: "test" })
}

const failParser = (input: ParseInput) => {
    input.context.test = "test"
    return input.failure({ expected: ["test"] })
}

describe("run", () => {
    it("should run a parser", () => {
        const input = new ParseInput("test", "test", {})
        expect(run(parser, input.clone())).toEqual(parser(input.clone()))
    })

    it("should run a lazy parser", () => {
        const input = new ParseInput("test", "test", {})
        const lazyParser = () => parser
        expect(run(lazyParser, input.clone())).toEqual(parser(input.clone()))
    })

    it("should allow mutation of the input", () => {
        const input = new ParseInput("test", "test", {})
        run(parser, input)
        expect(input).toEqual(new ParseInput("test", "test", { test: "test" }))
    })
})

describe("tryRun", () => {
    it("should run a parser", () => {
        const input = new ParseInput("test", "test", {})
        expect(run(parser, input.clone())).toEqual(parser(input.clone()))
    })

    it("should run a lazy parser", () => {
        const input = new ParseInput("test", "test", {})
        const lazyParser = () => parser
        expect(run(lazyParser, input.clone())).toEqual(parser(input.clone()))
    })

    it("should allow mutation of the input", () => {
        const input = new ParseInput("test", "test", {})
        tryRun(parser, input)
        expect(input).toEqual(new ParseInput("test", "test", { test: "test" }))
    })

    it("should rollback the input on failure", () => {
        const input = new ParseInput("test", "test", {})
        const oldInput = input.clone()
        tryRun(failParser, input)
        expect(input).toEqual(oldInput)
    })
})
