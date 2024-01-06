import { ParseInput } from "@/ParseInput"
import { run, type LazyParser, type Parser, type ParserType } from "@/Parser"

type MergedParserType<T extends readonly LazyParser<unknown>[]> = {
    -readonly [I in keyof T]: ParserType<T[I]>
}

export type MergedParser<T extends readonly LazyParser<unknown>[]> = Parser<MergedParserType<T>>

export type RepeatedParser<T> = Parser<T[]>

/*
 * Creates a parser that will match when all of its parsers matches in sequence
 */
export function seq<T extends readonly LazyParser<unknown>[]>(...parsers: T): MergedParser<T> {
    return (input) => {
        const value: unknown[] = new Array(parsers.length)

        let nextInput = input
        let start: number | undefined = undefined
        let end: number | undefined = undefined

        for (let i = 0; i < parsers.length; i++) {
            const result = run(parsers[i], nextInput)
            if (result.success) {
                value[i] = result.value

                if (start === undefined) {
                    start = result.loc[0]
                }

                end = result.loc[1]
                nextInput = new ParseInput(nextInput.source, end, result.next)
            } else {
                return result
            }
        }
        return input.success({
            value: value as MergedParserType<T>,
            start,
            end,
            next: nextInput.context,
        })
    }
}

/*
 * Creates a parser that will try to match the same parser repeated times
 */
export function many<T>(parser: LazyParser<T>, min: number, max: number): RepeatedParser<T> {
    return (input) => {
        const value: T[] = []

        let nextInput = input
        let start: number | undefined = undefined
        let end: number | undefined = undefined

        for (let i = 0; i < max; i++) {
            const result = run(parser, nextInput)
            if (result.success) {
                value.push(result.value)

                if (start === undefined) {
                    start = result.loc[0]
                }

                end = result.loc[1]
                nextInput = new ParseInput(nextInput.source, end, result.next)
            } else if (value.length < min) {
                return result
            } else {
                break
            }
        }
        return input.success({ value, start, end, next: nextInput.context })
    }
}

/*
 * Creates a parser that will try to match the same parser zero or more number of times
 */
export function many0<T>(parser: LazyParser<T>): RepeatedParser<T> {
    return many(parser, 0, Number.POSITIVE_INFINITY)
}

/*
 * Creates a parser that will try to match the same parser one or more number of times
 */
export function many1<T>(parser: LazyParser<T>): RepeatedParser<T> {
    return many(parser, 1, Number.POSITIVE_INFINITY)
}
