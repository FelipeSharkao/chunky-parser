export type Parser<T> = (context: ParseContext) => ParseResult<T>

export interface Source {
  name: string
  path: string
  content: string
}

export type ParseContext = {
  source: Source
  offset: number
}

export type ParseResult<T> = ParseSuccess<T> | ParseFailure
export type ParseSuccess<T> = Readonly<{
  success: true
  value: T
  context: ParseContext
}>
export type ParseFailure = Readonly<{
  success: false
  context: ParseContext
  expected: string[]
}>
