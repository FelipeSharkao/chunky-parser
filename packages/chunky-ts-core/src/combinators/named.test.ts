import { describe, expect, it } from 'bun:test'

import { str } from '@/parsers'
import { assertParser } from '@/utils'

import { label, named } from './named'

describe('named', () => {
  const parser = named('Named Test', str('foo'))

  it('succeeds when the orignal parser succeeds', () => {
    assertParser(parser, 'foo bar').succeeds(3, 'foo')
  })

  it('appends the name to expected when the orignal parser succeeds', () => {
    assertParser(parser, 'foo bar', 4).fails(0, ['Named Test'])
  })
})

describe('label', () => {
  const parser = label('test', str('foo'))

  it('succeeds when the orignal parser succeeds', () => {
    assertParser(parser, 'foo bar').succeeds(3, 'foo')
    assertParser(parser, 'foo bar', 4).fails()
  })

  it('add the resulting value into the payload', () => {
    const next = assertParser(parser, 'foo bar').succeeds(3, 'foo')
    expect(next.payload.test).toBe('foo')
  })
})
