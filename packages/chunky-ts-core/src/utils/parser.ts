import { LazyParser, ParseContext, ParseResult, ParserType, ParserValuesType } from '@/types'

/**
 * Runs a parser with a context and returns its result. Useful to handle lazy parsers
 */
export function run<T, P>(parser: LazyParser<T, P>, context: ParseContext): ParseResult<T, P> {
  const result = parser(context)
  if (typeof result == 'function') return run(parser, context)
  return result
}
