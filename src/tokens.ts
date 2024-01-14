import type { ParseInput } from "@/ParseInput"
import type { LocationRange, ParseResult } from "@/ParseResult"
import type { ParserClass } from "@/Parser"

/**
 * Represents a token parser. A token is a unit of text that is not further divided by the parser.
 * For example, a token could be a string literal, a number, a keyword, or a symbol.
 */
export class TokenParser<T extends string> implements ParserClass<Token<T>> {
    constructor(
        public name: string,
        public pattern: T | RegExp
    ) {
        if (pattern instanceof RegExp) {
            this.pattern = new RegExp(pattern.source, pattern.flags.replace(/[gy]/g, "") + "y")
        }
    }

    /**
     * Parses the input for a token of this type
     */
    parse(input: ParseInput): ParseResult<Token<T>> {
        const offset = input.offset
        const token = input.token(this)

        if (input.context.options?.log) {
            console.log(
                "[LOG] Looking for token",
                JSON.stringify(this.name),
                `at ${offset}:`,
                token ? "FOUND" : "NOT FOUND"
            )
        }

        return token
            ? { success: true, value: token, loc: token.loc }
            : { success: false, expected: [this.name], offset: input.offset }
    }

    /**
     * Creates a token of this type
     */
    token(value: T, loc: LocationRange): Token<T> {
        return new Token(this, value, loc)
    }
}

/**
 * Represents a token in the source text. Should not be used directly, but rather through parsing
 * the source text with a `TokenParser`
 */
export class Token<T extends string> {
    constructor(
        readonly type: TokenParser<T>,
        readonly text: T,
        readonly loc: LocationRange
    ) {}

    /**
     * Returns true if this token is of the specified type
     */
    is<T2 extends T>(type: TokenParser<T2>): this is Token<T & T2> {
        return this.type === type
    }
}
