import type { StackMap } from "@/ParseInput"
import { run, type Parser } from "@/Parser"

import { raw } from "./transform"

/**
 * Group of combinators that stores the parsed text, allowing for complex, context-aware syntaxes
 */
export class StackGroup {
    constructor() {}

    /**
     * Creates a parser that adds the matched text to the top of the text
     */
    push(parser: Parser<unknown>): Parser<string> {
        const rawParser = raw(parser)

        return (input) => {
            const result = run(rawParser, input)
            if (result.success) {
                if (!input.context.stacks) {
                    input.context.stacks = new Map()
                }

                let stack = input.context.stacks.get(this)
                if (!stack) {
                    stack = []
                    input.context.stacks.set(this, stack)
                }

                stack.push(result.value)
            }

            return result
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

            if (input.startsWith(item)) {
                return input.success({ value: item, length: item.length })
            }
            return input.failure({ expected: [JSON.stringify(item)] })
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

            if (input.startsWith(item)) {
                this.removeItem(input.context.stacks, start, end)
                return input.success({ value: item, length: item.length })
            }
            return input.failure({ expected: [JSON.stringify(item)] })
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
            this.removeItem(input.context.stacks, start, end)
            return input.success({ value: null })
        }
    }

    /**
     * Transforms the `start` and `end` arguments of a parser into indexes of the stack array.
     * Returns a tuple where the first element is the index of the start of the array slice, and
     * the second element is the index of the end of the array slice, exclusive. If the indexes are
     * out of bounds, returns null
     *
     * @arg map - The stack map to use
     * @arg start - The start of the range, inclusive. If positive, it will be counted from the end
     *              of the array. If negative, it will be counted from the start of the array
     * @arg end - The end of the range, inclusive. If positive, it will be counted from the end of
     *            the array. If negative, it will be counted from the start of the array
     */
    private rangeToIndexes(map: StackMap, start = 0, end = start) {
        const stack = map.get(this) || []

        if (start < 0) {
            start = stack.length - start
        }

        if (end < 0) {
            end = stack.length - end
        }

        if (start > end || start < 0 || end > stack.length) {
            return null
        }

        return [stack.length - end - 1, stack.length - start] as const
    }

    private getItem(map: StackMap | undefined, start?: number, end?: number) {
        const stack = map?.get(this)
        if (!map || !stack?.length) {
            return null
        }

        const idx = this.rangeToIndexes(map, start, end)
        if (idx === null) {
            return null
        }

        const text = stack.slice(idx[0], idx[1]).join("")
        return text
    }

    private removeItem(map: StackMap | undefined, start?: number, end?: number) {
        const stack = map?.get(this)
        if (!map || !stack?.length) {
            return
        }

        const idx = this.rangeToIndexes(map, start, end)

        if (stack.length && idx) {
            stack.splice(idx[0], idx[1] - idx[0])
        }
    }
}
