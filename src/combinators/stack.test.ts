import { describe, it } from "bun:test"

import type { ParseContext } from "@/ParseInput"
import { many1, seq } from "@/combinators"
import { alpha, str } from "@/parsers"
import { assertParser } from "@/utils/testing"

import { StackGroup } from "./stack"

describe("StackGroup", () => {
    const src = "Foo Bar Quz Qux Bar Foo Quz Qux "
    const word = seq(many1(alpha), str(" "))

    describe("push", () => {
        it("matches and push the text to the stack", () => {
            const stack = new StackGroup()
            assertParser(stack.push(word), src).succeeds(4, "Foo ")
        })

        it("fails if the original parser fails", () => {
            const stack = new StackGroup()
            assertParser(stack.push(word), src, { offset: 3 }).fails(0, [
                'any character between "A" and "Z"',
                'any character between "a" and "z"',
            ])
        })
    })

    describe("peek", () => {
        it("matches the text at the top of the stack", () => {
            const stack = new StackGroup()
            let context: ParseContext = {}
            context = assertParser(stack.push(word), src, {
                offset: 0,
                context,
            }).succeeds(4, "Foo ")
            context = assertParser(stack.push(word), src, {
                offset: 4,
                context,
            }).succeeds(4, "Bar ")
            context = assertParser(stack.peek(), src, {
                offset: 16,
                context,
            }).succeeds(4, "Bar ")
            assertParser(stack.peek(), src, {
                offset: 8,
                context,
            }).fails(0, ['"Bar "'])
        })

        it("matches the text at the n-th position of the stack", () => {
            const stack = new StackGroup()
            let context: ParseContext = {}
            context = assertParser(stack.push(word), src, {
                offset: 0,
                context,
            }).succeeds(4, "Foo ")
            context = assertParser(stack.push(word), src, {
                offset: 4,
                context,
            }).succeeds(4, "Bar ")
            context = assertParser(stack.peek(1), src, {
                offset: 20,
                context,
            }).succeeds(4, "Foo ")
            assertParser(stack.peek(1), src, {
                offset: 8,
                context,
            }).fails(0, ['"Foo "'])
        })

        it("matches the text at a range of the stack, from first inserted to last inserted", () => {
            const stack = new StackGroup()
            let context: ParseContext = {}
            context = assertParser(stack.push(word), src, {
                offset: 8,
                context,
            }).succeeds(4, "Quz ")
            context = assertParser(stack.push(word), src, {
                offset: 12,
                context,
            }).succeeds(4, "Qux ")
            context = assertParser(stack.peek(0, 1), src, {
                offset: 24,
                context,
            }).succeeds(8, "Quz Qux ")
            assertParser(stack.peek(0, 1), src, {
                offset: 4,
                context,
            }).fails(0, ['"Quz Qux "'])
        })

        it("fails if the stack is empty", () => {
            const stack = new StackGroup()
            assertParser(stack.peek(), src).fails(0)
        })

        it("does not removes the item matched from the stack", () => {
            const stack = new StackGroup()
            let context: ParseContext = {}
            context = assertParser(stack.push(word), src, {
                offset: 0,
                context,
            }).succeeds(4, "Foo ")
            context = assertParser(stack.push(word), src, {
                offset: 4,
                context,
            }).succeeds(4, "Bar ")
            context = assertParser(stack.peek(), src, {
                offset: 4,
                context,
            }).succeeds(4, "Bar ")
            context = assertParser(stack.peek(), src, {
                offset: 16,
                context,
            }).succeeds(4, "Bar ")
            assertParser(stack.peek(), src, {
                offset: 20,
                context,
            }).fails(0, ['"Bar "'])
        })
    })

    describe("pop", () => {
        it("matches the text at the top of the stack", () => {
            const stack = new StackGroup()
            let context: ParseContext = {}
            context = assertParser(stack.push(word), src, {
                offset: 0,
                context,
            }).succeeds(4, "Foo ")
            context = assertParser(stack.push(word), src, {
                offset: 4,
                context,
            }).succeeds(4, "Bar ")
            context = assertParser(stack.pop(), src, {
                offset: 16,
                context,
            }).succeeds(4, "Bar ")
            assertParser(stack.pop(), src, {
                offset: 8,
                context,
            }).fails(0, ['"Foo "'])
        })

        it("matches the text at the n-th position of the stack", () => {
            const stack = new StackGroup()
            let context: ParseContext = {}
            context = assertParser(stack.push(word), src, {
                offset: 0,
                context,
            }).succeeds(4, "Foo ")
            context = assertParser(stack.push(word), src, {
                offset: 4,
                context,
            }).succeeds(4, "Bar ")
            assertParser(stack.pop(1), src, {
                offset: 20,
                context,
            }).succeeds(4, "Foo ")
        })

        it("matches the text at a range of the stack, from first inserted to last inserted", () => {
            const stack = new StackGroup()
            let context: ParseContext = {}
            context = assertParser(stack.push(word), src, {
                offset: 8,
                context,
            }).succeeds(4, "Quz ")
            context = assertParser(stack.push(word), src, {
                offset: 12,
                context,
            }).succeeds(4, "Qux ")
            context = assertParser(stack.pop(0, 1), src, {
                offset: 24,
                context,
            }).succeeds(8, "Quz Qux ")
            assertParser(stack.pop(0, 1), src, {
                offset: 4,
                context,
            }).fails(0, [])
        })

        it("fails if the stack is empty", () => {
            const stack = new StackGroup()
            assertParser(stack.pop(), src).fails()
        })

        it("removes the item matched from the stack", () => {
            const stack = new StackGroup()
            let context: ParseContext = {}
            context = assertParser(stack.push(word), src, {
                offset: 0,
                context,
            }).succeeds(4, "Foo ")
            context = assertParser(stack.push(word), src, {
                offset: 4,
                context,
            }).succeeds(4, "Bar ")
            context = assertParser(stack.pop(), src, {
                offset: 16,
                context,
            }).succeeds(4, "Bar ")
            assertParser(stack.pop(), src, {
                offset: 20,
                context,
            }).succeeds(4, "Foo ")
        })
    })
})
