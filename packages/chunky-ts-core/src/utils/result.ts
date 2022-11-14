import { LocationRange, ParseContext, ParseFailure, ParseResult, ParseSuccess } from '@/types'

import { move } from './context'

/**
 * Create a success ParseResult
 */
export function success<T>(value: T, loc: LocationRange, next: ParseContext): ParseSuccess<T> {
  return { success: true, value, loc, next }
}

/**
 * Create a failure ParseResult
 */
export function failure(context: ParseContext, expected: string[] = []): ParseFailure {
  return { success: false, next: context, expected }
}

/**
 * Create a success ParseResult that consumes N characters of the buffer
 */
export function next(context: ParseContext, n: number): ParseResult<string> {
  if (n <= 0) throw new Error('expected a positive number')
  const loc: LocationRange = [context.offset, context.offset + n]
  return success(context.source.content.slice(...loc), loc, move(context, n))
}
