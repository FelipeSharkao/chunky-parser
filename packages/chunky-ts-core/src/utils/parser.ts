import { LazyParser, ParseContext, ParseResult } from '@/types'

/**
 * Runs a parser with a context and returns its result. Useful to handle lazy parsers
 */
export function run<T>(parser: LazyParser<T>, context: ParseContext): ParseResult<T> {
  const result = parser(context)
  if (typeof result == 'function') return run(parser, context)
  return result
}
