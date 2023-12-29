import { raw } from "@/combinators"
import { str } from "@/parsers"
import type { LazyParser, Parser } from "@/types"
import { failure, success } from "@/utils"

import type { StackMap } from "./types"

/**
 * Group of combinators that stores the parsed text, allowing for complex, context-aware syntaxes
 */
export class StackGroup {
    constructor(readonly name: string) {}

    /**
     * Creates a parser that adds the matched text to the top of the text
     */
    push(parser: LazyParser<any>): Parser<string> {
        return (ctx) => {
            const result = raw(parser)(ctx)
            if (result.success) {
                const stacks = { ...result.next.stacks }
                stacks[this.name] = [...(stacks[this.name] || []), result.value]
                return { ...result, next: { ...result.next, stacks } }
            } else {
                return result
            }
        }
    }

    /**
     * Creates a parser that matches the text at the top of the stack, without removing it. Fails if the stack is empty
     */
    peek(): Parser<string>
    /**
     * Creates a parser that matches the text of a item of the stack, without removing it. Fails if the stack is empty
     *
     * @arg at - The index of the item. If a negative number is passed, it will select the item from the bottom of the stack
     */
    peek(at: number): Parser<string>
    /**
     * Creates a parser that matches the text in a slice of the stack, without removing it. Fails if the stack is empty
     *
     * @arg start - The start of the slice, inclusive. If a negative number is passed, it will select the item from the bottom of the stack
     * @arg end - The end of the slice, inclusive. If a negative number is passed, it will select the item from the bottom of the stack
     */
    peek(start: number, end: number): Parser<string>
    peek(start?: number, end?: number): Parser<string> {
        return (ctx) => {
            try {
                return str(this.getItem(ctx.stacks, start, end))(ctx)
            } catch (_) {
                return failure(ctx)
            }
        }
    }

    /**
     * Creates a parser that matches the text at the top of the stack, removing it. Fails if the stack is empty
     */
    pop(): Parser<string>
    /**
     * Creates a parser that matches the text of a item of the stack, removing it. Fails if the stack is empty
     *
     * @arg at - The index of the item. If a negative number is passed, it will select the item from the bottom of the stack
     */
    pop(at: number): Parser<string>
    /**
     * Creates a parser that matches the text in a slice of the stack, removing it. Fails if the stack is empty
     *
     * @arg start - The start of the slice, inclusive. If a negative number is passed, it will select the item from the bottom of the stack
     * @arg end - The end of the slice, inclusive. If a negative number is passed, it will select the item from the bottom of the stack
     */
    pop(start: number, end: number): Parser<string>
    pop(start?: number, end?: number): Parser<string> {
        return (ctx) => {
            try {
                const res = { ...str(this.getItem(ctx.stacks, start, end))(ctx) }
                if (!res.success) return res
                res.next = { ...res.next, stacks: this.removeItem(res.next.stacks, start, end) }
                return res
            } catch (_) {
                return failure(ctx)
            }
        }
    }

    /**
     * Creates a parser that removes the item at the top of the stack
     */
    drop(): Parser<null>
    /**
     * Creates a parser that removes a item of the stack
     *
     * @arg at - The index of the item to be removed. If a negative number is passed, it will select the item from the bottom of the stack
     */
    drop(at: number): Parser<null>
    /**
     * Creates a parser that removes a slice of the stack
     *
     * @arg start - The start of the slice, inclusive. If a negative number is passed, it will select the item from the bottom of the stack
     * @arg end - The end of the slice, inclusive. If a negative number is passed, it will select the item from the bottom of the stack
     */
    drop(start: number, end: number): Parser<null>
    drop(start?: number, end?: number): Parser<null> {
        return (ctx) => {
            const next = { ...ctx, stacks: this.removeItem(ctx.stacks, start, end) }
            return success(null, [ctx.offset, ctx.offset], next)
        }
    }

    private fixRange(map: StackMap = {}, start = 0, end = start) {
        const array = map[this.name] || []
        if (start < 0) start = array.length - start
        if (end < 0) end = array.length - end
        if (start > end) end = start
        return [array.length - end - 1, array.length - start] as const
    }

    private getItem(map: StackMap = {}, start?: number, end?: number) {
        const [i, j] = this.fixRange(map, start, end)
        const array = map[this.name]
        if (!array?.length) throw new Error()
        const text = array.slice(i, j).join("")
        return text
    }

    private removeItem(map: StackMap = {}, start?: number, end?: number) {
        const [i, j] = this.fixRange(map, start, end)
        const res = { ...map }
        const array = (res[this.name] = [...(res[this.name] || [])])
        if (array.length) array.splice(i, j - i)
        return res
    }
}
