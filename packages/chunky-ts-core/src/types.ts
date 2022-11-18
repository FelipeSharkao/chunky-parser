export type Parser<T, P = {}> = (context: Readonly<ParseContext>) => ParseResult<T, P>
export type LazyParser<T, P = {}> = (() => Parser<T, P>) | Parser<T, P>

export type ParserType<T extends LazyParser<any>> = T extends LazyParser<infer R> ? R : never
export type ParserValuesType<T extends LazyParser<any, any>> = T extends LazyParser<any, infer R>
  ? R
  : never

export interface Source {
  name: string
  path: string
  content: string
}

export type LocationRange = readonly [number, number]

export interface ParseContext<P = {}> {
  source: Source
  offset: number
  payload: P
}

export type ParseResult<T, P = {}> = ParseSuccess<T, P> | ParseFailure
export type ParseSuccess<T, P = {}> = Readonly<{
  success: true
  value: T
  loc: LocationRange
  next: ParseContext<P>
}>
export type ParseFailure = Readonly<{
  success: false
  source: Source
  offset: number
  expected: string[]
}>
