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

/*
 * Creates a parser that will match if any of its parsers matches. Parsers are tested in order of
 * application, matching the first to succeed
 */
export function oneOf<T extends LazyParser<unknown>[]>(...parsers: T): OneOfParser<T[number]> {
    return (input) => {
        const expected = [] as string[]
        for (const parser of parsers) {
            const result = run(parser as OneOfParser<T[number]>, input)
            if (result.success) {
                return result
            } else {
                expected.push(...result.expected)
            }
        }
        return input.failure({ expected })
    }
}
