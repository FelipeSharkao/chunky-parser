import type { StackMap } from "@/ParseInput"
import type { LazyParser, Parser } from "@/Parser"
import { str } from "@/parsers"

import { raw } from "./transform"

/**
 * Group of combinators that stores the parsed text, allowing for complex, context-aware syntaxes
 */
export class StackGroup {
    constructor(readonly name: string) {}

    /**
     * Creates a parser that adds the matched text to the top of the text
     */
    push(parser: LazyParser<unknown>): Parser<string> {
        return (input) => {
            const result = raw(parser)(input)
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
     * Creates a parser that matches the text in a slice of the stack, without removing it. Fails if
     * the stack is empty
     *
     * @arg start - The start of the slice, inclusive. If a negative number is passed, it will
     *              select the item from the bottom of the stack
     * @arg end - The end of the slice, inclusive. If a negative number is passed, it will select
     *            the item from the bottom of the stack
     */
    peek(start?: number, end?: number): Parser<string> {
        return (input) => {
            const item = this.getItem(input.context.stacks, start, end)

            if (item === null) {
                return input.failure({ expected: [] })
            }

            const parser = str(item)
            return parser(input)
        }
    }

    /**
     * Creates a parser that matches the text in a slice of the stack, removing it. Fails if the
     * stack is empty
     *
     * @arg start - The start of the slice, inclusive. If a negative number is passed, it will
     *              select the item from the bottom of the stack
     * @arg end - The end of the slice, inclusive. If a negative number is passed, it will select
     *            the item from the bottom of the stack
     */
    pop(start?: number, end?: number): Parser<string> {
        return (input) => {
            const item = this.getItem(input.context.stacks, start, end)

            if (item === null) {
                return input.failure({ expected: [] })
            }

            const parser = str(item)
            const result = parser(input)

            if (!result.success) {
                return result
            }

            return {
                ...result,
                next: { ...result.next, stacks: this.removeItem(result.next.stacks, start, end) },
            }
        }
    }

    /**
     * Creates a parser that removes a slice of the stack
     *
     * @arg start - The start of the slice, inclusive. If a negative number is passed, it will
     *              select the item from the bottom of the stack
     * @arg end - The end of the slice, inclusive. If a negative number is passed, it will select
     *            the item from the bottom of the stack
     */
    drop(start?: number, end?: number): Parser<null> {
        return (input) => {
            const next = { ...input, stacks: this.removeItem(input.context.stacks, start, end) }
            return input.success({ value: null, next })
        }
    }

    /**
     * Transforms the `start` and `end` arguments of a parser into indexes of the stack array.
     * Returns a tuple where the first element is the index of the start of the array slice, and
     * the second element is the index of the end of the array slice, exclusive. If the indexes are
     * out of bounds, returns null
     *
     * @arg map - The stack map to use. Defaults to an empty object
     * @arg start - The start of the range, inclusive. If positive, it will be counted from the end
     *              of the array. If negative, it will be counted from the start of the array
     * @arg end - The end of the range, inclusive. If positive, it will be counted from the end of
     *            the array. If negative, it will be counted from the start of the array
     */
    private rangeToIndexes(map: StackMap = {}, start = 0, end = start) {
        const array = map[this.name] || []

        if (start < 0) {
            start = array.length - start
        }

        if (end < 0) {
            end = array.length - end
        }

        if (start > end || start < 0 || end > array.length) {
            return null
        }

        return [array.length - end - 1, array.length - start] as const
    }

    private getItem(map: StackMap = {}, start?: number, end?: number) {
        const idx = this.rangeToIndexes(map, start, end)
        const array = map[this.name]

        if (idx === null || !array?.length) {
            return null
        }

        const text = array.slice(...idx).join("")
        return text
    }

    private removeItem(map: StackMap = {}, start?: number, end?: number) {
        const idx = this.rangeToIndexes(map, start, end)

        const result = { ...map }
        const array = (result[this.name] = [...(result[this.name] || [])])

        if (array.length && idx) {
            array.splice(idx[0], idx[1] - idx[0])
        }

        return result
    }
}
