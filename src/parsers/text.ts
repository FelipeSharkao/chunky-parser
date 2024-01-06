import type { Parser } from "@/Parser"

/**
 * Creates a parser that matches a specific string
 */
export function str(value: string): Parser<string> {
    return (input) => {
        if (input.startsWith(value)) {
            return input.success({ value, length: value.length })
        }
        return input.failure({ expected: [JSON.stringify(value)] })
    }
}

/**
 * Creates a parser that match a regex at the cursor position
 */
export function re(regexp: RegExp): Parser<string> {
    return (input) => {
        const match = input.matches(regexp)
        if (match) {
            return input.success({ value: match[0], length: match[0].length })
        }
        return input.failure({ expected: [] })
    }
}

/**
 * Matches a character with the Unicode number property
 */
export const unum = re(/\p{N}/u)
/**
 * Matches a character with the Unicode letter property
 */
export const ualpha = re(/\p{L}/u)
/**
 * Matches a character with the Unicode letter or number property
 */
export const ualphanum = re(/[\p{L}\p{N}]/u)
