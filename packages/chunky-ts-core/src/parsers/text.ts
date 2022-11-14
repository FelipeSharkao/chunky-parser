import { Parser } from '@/types'
import { next, failure } from '@/utils'

/**
 * Creates a parser that mathes a specific string
 */
export function str(value: string): Parser<string> {
  return (ctx) => {
    if (ctx.source.content.startsWith(value, ctx.offset)) {
      return next(ctx, value.length)
    }
    return failure(ctx)
  }
}

/**
 * Creates a parser that match a regex at the cursor position
 */
export function re(regexp: RegExp): Parser<string> {
  return (ctx) => {
    const offsetRegexp = new RegExp(regexp, regexp.flags + 'g')
    offsetRegexp.lastIndex = ctx.offset

    const match = offsetRegexp.exec(ctx.source.content)
    if (match && match.index === ctx.offset) {
      return next(ctx, match[0].length)
    }
    return failure(ctx)
  }
}

/**
 * Matches a character with the unicode number property
 */
export const unum = re(/\p{N}/u)
/**
 * Matches a character with the unicode letter property
 */
export const ualpha = re(/\p{L}/u)
/**
 * Matches a character with the unicode letter or number property
 */
export const ualphanum = re(/[\p{L}\p{N}]/u)
