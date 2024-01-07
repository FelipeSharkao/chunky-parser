import { ParseInput } from "@/ParseInput"
import { run, type LazyParser, type Parser, type ParserType } from "@/Parser"

export type OptionalParser<T> = Parser<T | null>

export type OneOfParser<T extends LazyParser<unknown>> = Parser<ParserType<T>>

/*
 * Creates a parser that will match `null` instead of failing
 */
export function optional<T>(parser: LazyParser<T>): OptionalParser<T> {
    return (input) => {
        const result = run(parser, input)
        if (!result.success) {
            return input.success({ value: null })
        }
        return result
    }
}

/*
 * Creates a parser that will never consume any text
 */
export function predicate<T>(parser: LazyParser<T>): Parser<T> {
    return (input) => {
        const result = run(parser, input)
        if (result.success) {
            return input.success({ value: result.value, next: result.next })
        }
        return result
    }
}

/*
 * Creates a parser that will succeed if the original parser fails, and will fail if the original
 * parser succeeds.
 */
export function not(parser: LazyParser<unknown>): Parser<null> {
    return (input) => {
        const result = run(parser, input)
        if (result.success) {
            return input.failure({ expected: [] })
        } else {
            return input.success({ value: null })
        }
    }
}

type PrecedenceItem = {
    index: number
    offset: number
}

/*
 * Creates a parser that will match if any of its parsers matches. Parsers are tested in order of
 * application, matching the first to succeed
 */
export function oneOf<T extends LazyParser<unknown>[]>(...parsers: T): OneOfParser<T[number]> {
    // Handle recursive patters by keeping track of the current offset and the index of the parser.
    // Every time a parser fails, the index is incremented.
    // If the parser is executed again due to a recursive parser, it will skip to the index and
    // continue from there. But if the offset is the same, that indicates that the parser has left
    // recursion and is now in an infinite loop, so it starts at the next index instead.
    const stack: PrecedenceItem[] = []

    return (input) => {
        const prev = stack.length ? stack[stack.length - 1] : null

        const item = { index: prev ? prev.index : 0, offset: input.offset }
        stack.push(item)

        if (prev && prev.offset === input.offset) {
            item.index = prev.index + 1
        }

        const expected = [] as string[]
        for (; item.index < parsers.length; item.index++) {
            const result = run(parsers[item.index] as OneOfParser<T[number]>, input)
            if (result.success) {
                stack.pop()
                return result
            } else {
                expected.push(...result.expected)
            }
        }
        stack.pop()
        return input.failure({ expected })
    }
}
