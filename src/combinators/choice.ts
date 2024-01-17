import type { ParseResult } from "@/ParseResult"
import { run, type Parser, type ParserType, tryRun } from "@/Parser"

export type OptionalParser<T> = Parser<T | null>

export type OneOfParser<T extends Parser<unknown>> = Parser<ParserType<T>>

/**
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

/**
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

/**
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

/**
 * Creates a parser that will match if any of its parsers matches. In ambiguous cases, the last
 * parser to match will be used. If all parsers fail, the parser will fail.
 *
 * In recursive cases with a defined order of precedence, apply the parsers in order of precedence,
 * from highest to lowest. The parser will prefer the result with the lowest precedence that
 * includes results from higher precedence parsers, and will consume as much text as possible.
 */
export function oneOf<T extends Parser<unknown>[]>(...parsers: T): OneOfParser<T[number]> {
    const parser: OneOfParser<T[number]> = (input) => {
        let maxIdx = parsers.length - 1

        let recStack = input.recStacks.get(parser)
        if (!recStack) {
            recStack = []
            input.recStacks.set(parser, recStack)
        }

        let state = recStack[recStack.length - 1]
        const isLeftRec = state?.offset === input.offset

        if (!state || !isLeftRec) {
            // If the parser is not left recursive, we will run it as usual, so we need to push a
            // new state to the stack. But if the parser is right recursive and comes from a left
            // recursive sequence, we cannot check all options, but only those with a higher
            // precedence than the current one, or the tree will be mirrored (operations will be
            // evaluated right to left instead of left to right).
            maxIdx = state?.isLeftRec && state?.optIdx != null ? state.optIdx - 1 : maxIdx
            state = { offset: input.offset, optIdx: 0 }
            recStack.push(state)
        }

        const setResult = (result: ParseResult<unknown>) => {
            if (result.success || !state.lastRes) {
                state.lastRes = result
            } else if (
                !state.lastRes.success &&
                !result.success &&
                result.offset === state.lastRes.offset
            ) {
                state.lastRes.expected.push(...result.expected)
            }
            return state.lastRes as ParseResult<ParserType<T[number]>>
        }

        if (isLeftRec) {
            state.isLeftRec = true

            // If the parser is left recursive, we can assume that it was already ran at this offset
            // with higher precedence parsers. If those were successful, we want to build on top of
            // that. To do so, we run the parser with the same index as before twice, once with the
            // recursion disabled, and once with it enabled. If the recursion is disabled, the
            // parser will only return the last result, and will not recurse. This makes sure that
            // we're doing the recursion in incremental steps, and will abort once no more progress
            // can be made.
            if (!state.lastRes) {
                throw new Error(
                    "`oneOf` parser is infinitely left recursive. Make sure that all recursive parsers have a non-recursive option at highest precedence"
                )
            }

            if (state.disableRec || !state.lastRes.success) {
                return state.lastRes as ParseResult<ParserType<T[number]>>
            }

            state.disableRec = true
            const result = tryRun(parsers[state.optIdx], input)
            setResult(result)
            state.disableRec = false

            if (!result.success) {
                return state.lastRes as ParseResult<ParserType<T[number]>>
            }

            input.offset = state.offset
            setResult(tryRun(parsers[state.optIdx], input))
            return state.lastRes as ParseResult<ParserType<T[number]>>
        }

        try {
            for (; state.optIdx <= maxIdx; state.optIdx++) {
                state.isLeftRec = false
                input.offset = state.offset

                const result = tryRun(parsers[state.optIdx], input)
                setResult(result)
            }

            return state.lastRes as ParseResult<ParserType<T[number]>>
        } finally {
            recStack.pop()
        }
    }

    return parser
}
