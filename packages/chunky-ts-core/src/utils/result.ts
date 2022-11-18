import { LocationRange, ParseContext, ParseFailure, ParseResult, ParseSuccess } from '@/types'

import { move } from './context'

/**
 * Create a success ParseResult
 */
export function success<T, P>(
  value: T,
  loc: LocationRange,
  next: ParseContext<P>
): ParseSuccess<T, P> {
  return { success: true, value, loc, next }
}

/**
 * Create a failure ParseResult
 */
export function failure(context: ParseContext, expected: string[] = []): ParseFailure {
  return { success: false, expected, source: context.source, offset: context.offset }
}

/**
 * Create a success ParseResult that consumes N characters of the buffer
 */
export function next<P>(context: ParseContext<P>, n: number): ParseResult<string, P> {
  if (n <= 0) throw new Error('expected a positive number')
  const loc: LocationRange = [context.offset, context.offset + n]
  return success(context.source.content.slice(...loc), loc, move(context, n))
}
