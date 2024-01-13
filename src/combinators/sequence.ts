import { run, type Parser, type ParserType } from "@/Parser"

type MergedParserType<T extends readonly Parser<unknown>[]> = {
    -readonly [I in keyof T]: ParserType<T[I]>
}

export type MergedParser<T extends readonly Parser<unknown>[]> = Parser<MergedParserType<T>>

export type RepeatedParser<T> = Parser<T[]>

/*
 * Creates a parser that will match when all of its parsers matches in sequence
 */
export function seq<T extends readonly Parser<unknown>[]>(...parsers: T): MergedParser<T> {
    return (input) => {
        const value: unknown[] = new Array(parsers.length)

        let start: number | undefined = undefined
        let end: number | undefined = undefined

        for (let i = 0; i < parsers.length; i++) {
            const result = run(parsers[i], input)
            if (result.success) {
                value[i] = result.value

                if (start === undefined) {
                    start = result.loc[0]
                }
                end = result.loc[1]
            } else {
                return result
            }
        }
        return input.success({
            value: value as MergedParserType<T>,
            start,
            end,
        })
    }
}

/*
 * Creates a parser that will try to match the same parser repeated times
 */
export function many<T>(parser: Parser<T>, min: number, max = min): RepeatedParser<T> {
    return (input) => {
        const value: T[] = []

        let start: number | undefined = undefined
        let end: number | undefined = undefined

        for (let i = 0; i < max; i++) {
            const result = run(parser, input)
            if (result.success) {
                value.push(result.value)

                if (start === undefined) {
                    start = result.loc[0]
                }
                end = result.loc[1]
            } else if (value.length < min) {
                return result
            } else {
                break
            }
        }
        return input.success({ value, start, end })
    }
}

/*
 * Creates a parser that will try to match the same parser zero or more number of times
 */
export function many0<T>(parser: Parser<T>): RepeatedParser<T> {
    return many(parser, 0, Number.POSITIVE_INFINITY)
}

/*
 * Creates a parser that will try to match the same parser one or more number of times
 */
export function many1<T>(parser: Parser<T>): RepeatedParser<T> {
    return many(parser, 1, Number.POSITIVE_INFINITY)
}
