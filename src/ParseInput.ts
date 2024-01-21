import type { ParseFailure, ParseSuccess } from "@/ParseResult"
import type { Token, TokenParser } from "@/tokens"

import type { Parser } from "./Parser"
import type { RecState } from "./combinators/choice"

export interface ParseContext {
    /** @internal */
    test?: string
    /**
     * Specifies options for the parsers
     */
    log?: {
        /**
         * If true, token and named parsers will log their results to the console. Use for debugging
         * purposes
         */
        enabled?: boolean
        /**
         * Determines how many spaces to indent the log output
         */
        indent?: number
    }
}

/**
 * Represents a input for a parser. It references a point in the source text being parsed without
 * copying it, and contains the context of the previous parsers
 */
export class ParseInput {
    private tokens: Token<string>[] = []
    private srcCursor = 0
    private tkCursor = 0

    constructor(
        readonly path: string,
        readonly content: string,
        public context: ParseContext
    ) {}

    clone(): ParseInput {
        const newInput = new ParseInput(this.path, this.content, structuredClone(this.context))
        newInput.tokens = this.tokens
        newInput.srcCursor = this.srcCursor
        newInput.tkCursor = this.tkCursor
        return newInput
    }

    /**
     * Returns a token of the specified type from the current input if the current input starts with
     * this token type, or null otherwise
     */
    token<T extends string>(type: TokenParser<T>): Token<T> | null {
        if (this.tkCursor < this.tokens.length) {
            const tk = this.tokens[this.tkCursor]

            if (tk.is(type) && tk.loc[0] === this.srcCursor) {
                return tk
            }

            return null
        }

        const match = this.match(type.pattern)

        if (match != null) {
            const tk = type.token(match as T, [this.srcCursor, this.srcCursor + match.length])
            this.tokens.push(tk)
            return tk
        }

        return null
    }

    /**
     * Returns true if the source text at the offset starts with `search`
     */
    startsWith(search: string): boolean {
        return this.content.startsWith(search, this.offset)
    }

    /**
     * Returns a ParseSuccess from the current input
     */
    success<T>(opts: SuccessOptions<T>): ParseSuccess<T> {
        return {
            success: true,
            value: opts.value,
            loc: [opts.start ?? this.offset, opts.end ?? this.offset + (opts.length || 0)],
        }
    }

    /**
     * Returns a ParseFailure from the current input
     */
    failure(opts: FailureOptions): ParseFailure {
        return {
            success: false,
            offset: opts.offset ?? this.offset + (opts.move || 0),
            expected: opts.expected,
        }
    }

    /**
     * Returns the length of the source text after the offset
     */
    get length(): number {
        return this.content.length - this.offset
    }

    /**
     * Returns the current offset of the input
     */
    get offset(): number {
        return this.srcCursor
    }

    /**
     * Sets the current offset of the input
     *
     * @throws If the offset is out of bounds of the source text or if it points to a token that
     *         hasn't been parsed yet
     */
    set offset(value: number) {
        if (value < 0 || value > this.content.length) {
            throw new Error(`Offset ${value} is out of bounds`)
        }

        if (value > (this.tokens[this.tokens.length - 1]?.loc[1] ?? 0)) {
            throw new Error(`Offset ${value} points to a token that hasn't been parsed yet`)
        }

        if (this.srcCursor === value) {
            return
        }

        if (value < this.srcCursor) {
            while (
                this.tkCursor > 0 &&
                (this.tkCursor >= this.tokens.length || this.tokens[this.tkCursor].loc[0] > value)
            ) {
                this.tkCursor -= 1
            }
        } else {
            while (
                this.tkCursor < this.tokens.length &&
                this.tokens[this.tkCursor].loc[1] <= value
            ) {
                this.tkCursor += 1
            }
        }

        this.srcCursor = value
    }

    /**
     * Match the source text at the offset with the specified pattern
     */
    private match(pat: string | RegExp): string | null {
        if (typeof pat == "string") {
            if (this.content.startsWith(pat, this.offset)) {
                return pat
            }
        } else {
            const re = new RegExp(pat.source, pat.flags)
            re.lastIndex = this.offset

            const match = re.exec(this.content)
            if (match?.length) {
                return match[0]
            }
        }

        return null
    }
}

/**
 * Options for creating a ParseSuccess
 */
type SuccessOptions<T> = {
    /**
     * The parsed value
     */
    value: T
    /**
     * The start of the parsed value. Defaults to the current offset of the input
     */
    start?: number
    /**
     * The end of the parsed value. Defaults to the current offset of the input
     */
    end?: number
    /**
     *  The length of the parsed value. Will be ignored if `end` is specified
     */
    length?: number
}

/**
 * Options for creating a ParseFailure
 */
type FailureOptions = {
    /**
     * An array of strings representing what kind of input was expected
     */
    expected: string[]
    /**
     * The offset to use for the failure. Defaults to the current offset of the input
     */
    offset?: number
    /**
     * The amount of characters to move the offset. Will be ignored if `offset` is specified
     */
    move?: number
}
