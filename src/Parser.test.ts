import { describe, it, expect } from "bun:test"

import { ParseInput } from "@/ParseInput"

import { run, tryRun } from "./Parser"

const parser = (input: ParseInput) => {
    input.context.test = "test"
    input.offset += 2
    return input.success({ value: "test" })
}

const mutateAndFail = (input: ParseInput) => {
    input.context.test = "test"
    input.offset += 2
    return input.failure({ expected: ["test"] })
}

describe("run", () => {
    it("should run a parser", () => {
        const input = new ParseInput({ path: "test", content: "test" }, 0, {})
        expect(run(parser, input.clone())).toEqual(parser(input.clone()))
    })

    it("should run a lazy parser", () => {
        const input = new ParseInput({ path: "test", content: "test" }, 0, {})
        const lazyParser = () => parser
        expect(run(lazyParser, input.clone())).toEqual(parser(input.clone()))
    })

    it("should allow mutation of the input", () => {
        const input = new ParseInput({ path: "test", content: "test" }, 0, {})
        const source = { ...input.source }
        run(parser, input)
        expect(input).toEqual(new ParseInput(source, 2, { test: "test" }))
    })
})

describe("tryRun", () => {
    it("should run a parser", () => {
        const input = new ParseInput({ path: "test", content: "test" }, 0, {})
        expect(run(parser, input.clone())).toEqual(parser(input.clone()))
    })

    it("should run a lazy parser", () => {
        const input = new ParseInput({ path: "test", content: "test" }, 0, {})
        const lazyParser = () => parser
        expect(run(lazyParser, input.clone())).toEqual(parser(input.clone()))
    })

    it("should allow mutation of the input", () => {
        const input = new ParseInput({ path: "test", content: "test" }, 0, {})
        const source = { ...input.source }
        tryRun(parser, input)
        expect(input).toEqual(new ParseInput(source, 2, { test: "test" }))
    })

    it("should rollback the input on failure", () => {
        const input = new ParseInput({ path: "test", content: "test" }, 0, {})
        const oldInput = input.clone()
        tryRun(mutateAndFail, input)
        expect(input).toEqual(oldInput)
    })
})
