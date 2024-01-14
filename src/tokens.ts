import type { Simplify } from "type-fest"

import type { ParseInput } from "@/ParseInput"
import type { LocationRange, ParseResult } from "@/ParseResult"
import type { ParserClass } from "@/Parser"

export class Token<K extends string> {
    constructor(
        readonly key: K,
        readonly text: string,
        readonly loc: LocationRange
    ) {}

    is<K2 extends K>(type: TokenType<K2>): this is Token<K2> {
        return this.key === type.key
    }
}

export class TokenType<K extends string> implements ParserClass<Token<K>> {
    constructor(
        readonly key: K,
        public name: string,
        public pattern: string | RegExp
    ) {}

    parse(input: ParseInput): ParseResult<Token<K>> {
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

    token(value: string, loc: LocationRange): Token<K> {
        return new Token(this.key, value, loc)
    }
}

/**
 * Creates a set of token types from a definition object
 */
export function tokens<T extends TokensDefinition>(definition: T): TokensFromDefinition<T> {
    const result = {} as TokensFromDefinition<T>

    for (const key in definition) {
        const item = definition[key]
        let pat = item.pattern

        if (pat instanceof RegExp) {
            pat = new RegExp(pat.source, pat.flags.replace("g", "") + "y")
        }

        result[key] = new TokenType(key, item.name || key, pat)
    }

    return result
}

type TokensDefinition = {
    [key: string]: { name?: string; pattern: string | RegExp }
}

type TokensFromDefinition<T extends TokensDefinition> = Simplify<{
    [K in keyof T & string]: TokenType<K>
}>
