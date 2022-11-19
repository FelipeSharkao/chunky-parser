import { describe, it } from 'bun:test'

import { label } from '@/combinators/named'
import { num } from '@/parsers'
import { assertParser } from '@/utils'

import { map, raw } from './transform'

describe('map', () => {
  it('transforms the output of a parser', () => {
    const parser = map(num, (res) => Number(res.value))
    const src = '12'
    assertParser(parser, src, 0).succeeds(1, 1)
    assertParser(parser, src, 1).succeeds(1, 2)
  })

  it('allows to access the payload value', () => {
    const parserWithLabel = map(label('number', num), (res) => Number(res))
    const parser = map(parserWithLabel, (res) => res.payload.number)

    const src = '12'
    assertParser(parser, src, 0).succeeds(1, '1')
    assertParser(parser, src, 1).succeeds(1, '2')
  })

  it('fails when the original parser fails', () => {
    const parser = map(num, (res) => Number(res.value))
    const src = '1a'
    assertParser(parser, src, 0).succeeds(1, 1)
    assertParser(parser, src, 1).fails()
  })
})

describe('raw', () => {
  it('discards the parser value and results the original text', () => {
    const parser = raw(map(num, (value) => Number(value)))
    const src = '12'
    assertParser(parser, src, 0).succeeds(1, '1')
    assertParser(parser, src, 1).succeeds(1, '2')
  })

  it('fails when the original parser fails', () => {
    const parser = raw(map(num, (value) => Number(value)))
    const src = '1a'
    assertParser(parser, src, 0).succeeds(1, '1')
    assertParser(parser, src, 1).fails()
  })
})
