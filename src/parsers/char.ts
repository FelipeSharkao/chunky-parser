import type { Parser } from "@/Parser"

/**
 * Matches a sigle, no-specified character
 */
export const any: Parser<string> = (input) => {
    if (input.length > 0) {
        return input.success({ value: input.take(1), length: 1 })
    }
    return input.failure({ expected: ["any character"] })
}

/**
 * Creates a parser that matches any of the specified characters
 */
export function anyOf(characters: string): Parser<string> {
    const charArray = characters.split("")
    return (input) => {
        const c = input.take(1)
        if (charArray.includes(c)) {
            return input.success({ value: c, length: 1 })
        }
        return input.failure({ expected: charArray.map((c) => JSON.stringify(c)) })
    }
}

class CharRange {
    private min: number
    private max: number

    constructor(pair: string) {
        if (pair.length !== 2) throw new Error("Invalid pair: " + pair)
        this.min = pair.charCodeAt(0)
        this.max = pair.charCodeAt(1)
    }

    match(char: string) {
        const c = char.charCodeAt(0)
        return c >= this.min && c <= this.max
    }

    toString() {
        const cMin = String.fromCharCode(this.min)
        const cMax = String.fromCharCode(this.max)
        return `any character between ${JSON.stringify(cMin)} and ${JSON.stringify(cMax)}`
    }
}

/**
 * Creates a parser that matches any character within the specified range
 */
export function anyIn(...ranges: string[]): Parser<string> {
    const nRanges = ranges.map((x) => new CharRange(x))
    return (input) => {
        for (const range of nRanges) {
            const c = input.take(1)
            if (c && range.match(c)) {
                return input.success({ value: c, length: 1 })
            }
        }
        return input.failure({ expected: nRanges.map((x) => x.toString()) })
    }
}

/**
 * Matches any character between 0 and 9
 */
export const num = anyIn("09")
/**
 * Matches any character between A and Z, ignoring case
 */
export const alpha = anyIn("az", "AZ")
/**
 * Matches any character between A and Z or between o and 9, ignoring case
 */
export const alphanum = anyIn("09", "az", "AZ")
