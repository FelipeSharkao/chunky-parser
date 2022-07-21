import { Parser } from './types'

export * from './types'

export function parse<T>(parser: Parser<T>, fileName: string, content: string): T {
  const result = parser({ fileName, content, offset: 0 })
  if (result.success) {
    return result.value
  }
  throw new Error(
    'Parsing error\n\n' +
      `At ${result.context.fileName}\n` +
      (result.expected.length === 0
        ? '    Unexpected input.'
        : `    Unexpected input. Expected one of: ${result.expected.join(', ')}`)
  )
}
