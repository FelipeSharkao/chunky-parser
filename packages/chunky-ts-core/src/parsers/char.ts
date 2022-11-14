import { Parser } from '@/types'
import { failure, next } from '@/utils'

/**
 * Matches a sigle, no-specified character
 */
export const any: Parser<string> = (ctx) => {
  if (ctx.offset < ctx.source.content.length) {
    return next(ctx, 1)
  }
  return failure(ctx)
}

/**
 * Creates a parser that matches any of the specified characters
 */
export function anyOf(characters: string): Parser<string> {
  const charArray = characters.split('')
  return (ctx) => {
    if (charArray.includes(ctx.source.content[ctx.offset])) {
      return next(ctx, 1)
    }
    return failure(ctx)
  }
}

class CharRange {
  private min: number
  private max: number

  constructor(pair: string) {
    if (pair.length !== 2) throw new Error('Invalid pair: ' + pair)
    this.min = pair.charCodeAt(0)
    this.max = pair.charCodeAt(1)
  }

  match(char: string) {
    const c = char.charCodeAt(0)
    return c >= this.min && c <= this.max
  }
}

/**
 * Creates a parser that matches any character within the specified range
 */
export function anyIn(...ranges: string[]): Parser<string> {
  const nRanges = ranges.map((x) => new CharRange(x))
  return (ctx) => {
    for (const range of nRanges) {
      const c = ctx.source.content[ctx.offset]
      if (c && range.match(c)) {
        return next(ctx, 1)
      }
    }
    return failure(ctx)
  }
}

/**
 * Matches any character between 0 and 9
 */
export const num = anyIn('09')
/**
 * Matches any character between A and Z, ignoring case
 */
export const alpha = anyIn('az', 'AZ')
/**
 * Matches any character between A and Z or between o and 9, ignoring case
 */
export const alphanum = anyIn('09', 'az', 'AZ')
