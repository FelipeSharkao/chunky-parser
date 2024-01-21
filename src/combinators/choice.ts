import type { ParseInput } from "@/ParseInput"
import type { ParseResult } from "@/ParseResult"
import { run, type Parser, type ParserType, tryRun, type ParserClass } from "@/Parser"

/**
 * Creates a parser that will match `null` instead of failing
 */
export function optional<T>(parser: Parser<T>): Parser<T | null> {
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
 * Creates a parser that will match if any of its parsers matches. In ambiguous cases, the first
 * parser to match will be used. If all parsers fail, the parser will fail.
 */
export function oneOf<T extends Parser<unknown>[]>(...parsers: T): Parser<ParserType<T[number]>> {
    return (input) => {
        const expected: string[] = []

        for (let i = 0; i < parsers.length; i++) {
            const result = tryRun(parsers[i], input)

            if (result.success) {
                return result as ParseResult<ParserType<T[number]>>
            }

            expected.push(...result.expected)
        }

        return input.failure({ expected }) as ParseResult<ParserType<T[number]>>
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
export function withPrecedence<T extends Parser<unknown>[]>(
    ...parsers: T
): ParserWithPrecedence<ParserType<T[number]>> {
    return new ParserWithPrecedence(parsers as Parser<ParserType<T[number]>>[])
}

export class RecState {
    offset: number
    idx = 0
    result: ParseResult<unknown> | null = null
    disableRec = false

    constructor(input: ParseInput) {
        this.offset = input.offset
    }

    setResult(result: ParseResult<unknown>) {
        if (result.success || !this.result) {
            this.result = result
            return
        }

        if (!this.result.success && !result.success && result.offset === this.result.offset) {
            this.result.expected.push(...result.expected)
        }
    }
}

export class ParserWithPrecedence<T> implements ParserClass<T> {
    /** key: input.path */
    private stacks = new Map<string, RecState[]>()

    constructor(public readonly parsers: Parser<T>[]) {}

    parse(input: ParseInput): ParseResult<T> {
        let stack = this.stacks.get(input.path)
        if (!stack) {
            stack = []
            this.stacks.set(input.path, stack)
        }

        const state = new RecState(input)
        stack.push(state)

        try {
            for (; state.idx < this.parsers.length; state.idx++) {
                input.offset = state.offset

                const result = tryRun(this.parsers[state.idx], input)
                state.setResult(result)
            }

            return state.result as ParseResult<T>
        } finally {
            stack.pop()
        }
    }

    /**
     * A copy of the parser that can be used in the left (beginning) of a sequence. This parser will
     * limit recursion to avoid infinite loops. Note that this parser will not be able to match
     * items of a lower precedence than the current one, in a greedy manner. This is necessary to
     * correctly match left-to-right nested operations, like `1 + 2 + 3`.
     *
     * @throws If the parser is not in a recursive context or if it's in a `recOneOf` that doesn't
     *         have a base case as its first option
     */
    readonly left: Parser<T> = (input) => {
        const stack = this.stacks.get(input.path)
        const state = stack?.[stack.length - 1]

        if (!state) {
            throw new Error(
                "`recOneOf.left` parser is not in a recursive context. Make sure that it is used inside a `recOneOf`, directly or indirectly"
            )
        }

        // If the parser is left recursive, we can assume that it was already ran at this offset
        // with higher precedence parsers. If those were successful, we want to build on top of
        // that. To do so, we run the parser with the same index as before twice, once with the
        // recursion disabled, and once with it enabled. If the recursion is disabled, the parser
        // will only return the last result, and will not recurse. This makes sure that we're doing
        // the recursion in incremental steps, and will abort once no more progress can be made.
        if (!state.result) {
            throw new Error(
                "`recOneOf.left` parser is infinitely recursive. Make sure that all recursive parsers have a base case its first option"
            )
        }

        if (state.disableRec || !state.result.success) {
            return state.result as ParseResult<T>
        }

        let result: ParseResult<T>

        state.disableRec = true
        result = tryRun(this.parsers[state.idx], input)
        state.setResult(result)
        state.disableRec = false

        if (!result.success) {
            return state.result as ParseResult<T>
        }

        input.offset = state.offset

        result = tryRun(this.parsers[state.idx], input)
        state.setResult(result)

        return state.result as ParseResult<T>
    }

    /**
     * A copy of the parser that can be used in the right (end) of a sequence. This parser will not
     * limit recursion, but will only match items of a higher precedence than the current one, in a
     * non greedy manner. This is necessary to avoid matching left-to-right nested operations as
     * right-to-left (`1 + 2 + 3` would be matched as `1 + (2 + 3)`).
     *
     * @throws If the parser is not in a recursive context
     */
    readonly right: Parser<T> = (input) => {
        const stack = this.stacks.get(input.path)
        let state = stack?.[stack.length - 1]

        if (!stack || !state) {
            throw new Error(
                "`recOneOf.right` parser is not in a recursive context. Make sure that it is used inside a `recOneOf`, directly or indirectly"
            )
        }

        const limit = state.idx

        state = new RecState(input)
        stack.push(state)

        try {
            for (; state.idx < limit; state.idx++) {
                input.offset = state.offset

                const result = tryRun(this.parsers[state.idx], input)
                state.setResult(result)
            }

            return state.result as ParseResult<T>
        } finally {
            stack.pop()
        }
    }
}
