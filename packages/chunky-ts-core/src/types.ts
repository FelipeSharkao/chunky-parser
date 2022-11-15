export type Parser<T> = (context: Readonly<ParseContext>) => ParseResult<T>
export type LazyParser<T> = (() => Parser<T>) | Parser<T>
export type ParserType<T extends LazyParser<any>> = T extends Parser<infer R> ? R : never

export interface Source {
  name: string
  path: string
  content: string
}

export type LocationRange = readonly [number, number]

export interface ParseContext {
  source: Source
  offset: number
}

export type ParseResult<T> = ParseSuccess<T> | ParseFailure
export type ParseSuccess<T> = Readonly<{
  success: true
  value: T
  loc: LocationRange
  next: ParseContext
}>
export type ParseFailure = Readonly<{
  success: false
  next: ParseContext
  expected: string[]
}>
