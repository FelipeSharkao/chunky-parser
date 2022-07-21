export type Parser<T> = (context: ParseContext) => ParseResult<T>

export type ParseContext = {
  fileName: string
  content: string
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
