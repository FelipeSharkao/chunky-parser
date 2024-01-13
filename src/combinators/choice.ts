import type { ParseResult } from "@/ParseResult"
import { run, type Parser, type ParserType, tryRun } from "@/Parser"

export type OptionalParser<T> = Parser<T | null>

export type OneOfParser<T extends Parser<unknown>> = Parser<ParserType<T>>

/*
 * Creates a parser that will match `null` instead of failing
 */
export function optional<T>(parser: Parser<T>): OptionalParser<T> {
    return (input) => {
        const result = tryRun(parser, input)
        if (!result.success) {
            return input.success({ value: null })
        }
        return result
    }
}

/*
 * Creates a parser that will never consume any text
 */
export function predicate<T>(parser: Parser<T>): Parser<T> {
    return (input) => {
        const oldOffset = input.offset
        const result = tryRun(parser, input)
        if (result.success) {
            input.offset = oldOffset
            return input.success({ value: result.value })
        }
        return result
    }
}

/*
 * Creates a parser that will succeed if the original parser fails, and will fail if the original
 * parser succeeds.
 */
export function not(parser: Parser<unknown>): Parser<null> {
    return (input) => {
        const result = run(parser, input.clone())
        if (result.success) {
            return input.failure({ expected: [] })
        } else {
            return input.success({ value: null })
        }
    }
}

/*
 * Creates a parser that will match if any of its parsers matches. Parsers are tested in
 * order of application, matching the first to succeed
 */
export function oneOf<T extends Parser<unknown>[]>(...parsers: T): OneOfParser<T[number]> {
    // Handle recursive patters by keeping track of the last used index at that offset.
    // If the parser is executed again at the same tree due to a recursive parser, it will skip to
    // the next index and continue from there. This avoids infinity loops due to left recursion.

    const recStack: { offset: number; idx: number; count: number }[] = []

    // Key: "offset:index"
    const cache = new Map<string, ParseResult<ParserType<T[number]>>>()

    return (input) => {
        const expected = [] as string[]

        const lastRec = recStack[recStack.length - 1]
        const rec = lastRec
            ? { offset: input.offset, idx: lastRec.idx, count: lastRec.count + 1 }
            : { offset: input.offset, idx: 0, count: 0 }
        recStack.push(rec)

        // FIXME: using the remaining length will most likely create excessive stack frames. It
        // would be better if the text was already tokenized first, greatly reducing the length of
        // the input.
        if (
            lastRec &&
            (lastRec.offset !== input.offset || rec.count > Math.min(input.length + 1, 20))
        ) {
            rec.idx += 1
            rec.count = 0
        }

        try {
            for (; rec.idx < parsers.length; rec.idx++) {
                const cacheKey = `${input.offset}:${rec.idx}`

                // Only run the parser if it hasn't been run at this offset before
                let cached = cache.get(cacheKey)
                let result = cached

                if (!result) {
                    result = tryRun(parsers[rec.idx] as OneOfParser<T[number]>, input)
                }

                // If the parser is left recursive, a lot of repeated call stacks will be created.
                // In one of them, the parser might succeed with the complete tree, but as the
                // previous ones are still running, they will fail. We want to cache every success
                // so if the parser fails due to this nesting, we can recover the successful result.
                // We will also cache the first failure, but the next ones are probably due to this
                // nesting shenanigans, so we will ignore them.
                cached = cache.get(cacheKey)
                if (result !== cached && result.success) {
                    cache.set(cacheKey, result)
                } else if (cached) {
                    result = cached
                }

                if (result.success) {
                    return result
                } else {
                    // If the parser is left recursive, we want to recover the successful result
                    // from a nested attempt
                    if (cached?.success) {
                        return cached
                    }

                    expected.push(...result.expected)
                }
            }
            return input.failure({ expected })
        } finally {
            recStack.pop()
        }
    }
}
