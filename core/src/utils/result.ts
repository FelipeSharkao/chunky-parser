import { ParseContext, ParseFailure, ParseResult, ParseSuccess } from '@/types'

import { move } from './context'

/**
 * Create a success ParseResult
 */
export function success<T>(context: ParseContext, value: T): ParseSuccess<T> {
  return { success: true, context, value }
}

/**
 * Create a failure ParseResult
 */
export function failure(context: ParseContext, expected: string[] = []): ParseFailure {
  return { success: false, context, expected }
}

/**
 * Create a success ParseResult that consumes N characters of the buffer
 */
export function next(context: ParseContext, n: number): ParseResult<string> {
  if (n <= 0) throw new Error('expected a positive number')
  return success(move(context, n), context.content.slice(context.offset, context.offset + n))
}
