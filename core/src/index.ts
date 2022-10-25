import { Parser, Source } from '@/types'

export * from '@/combinators'
export * from '@/parsers'
export * from '@/types'
export * from '@/utils'

export function parse<T>(parser: Parser<T>, source: Source): T {
  const result = parser({ source, offset: 0 })
  if (result.success) {
    return result.value
  }
  throw new Error(
    'Parsing error\n\n' +
      `At ${result.next.source.path}\n` +
      (result.expected.length === 0
        ? '    Unexpected input.'
        : `    Unexpected input. Expected one of: ${result.expected.join(', ')}`)
  )
}
