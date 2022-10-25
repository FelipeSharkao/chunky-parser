import { describe, it, expect } from 'bun:test'

import { alpha, num } from '@/parsers'
import { assertParser } from '@/utils'

import { seq, many, many0, many1 } from './sequence'

describe('seq', () => {
  const parser = seq(num, num, alpha)

  it('succeedes when all the original parsers matches in sequence', () => {
    const src = '12ab'
    assertParser(parser, src, 0).succeeds(3, ['1', '2', 'a'])
  })

  it('fails when any of the original parsers fails', () => {
    const src = '12ab'
    assertParser(parser, src, 1).fails(1)
  })
})

describe('many', () => {
  const parser = many(num, 2, 4)

  it('succeedes if the original parser matches N-M times in sequence', () => {
    const src = '12-345-6789'
    assertParser(parser, src, 0).succeeds(2, ['1', '2'])
    assertParser(parser, src, 3).succeeds(3, ['3', '4', '5'])
    assertParser(parser, src, 7).succeeds(4, ['6', '7', '8', '9'])
  })

  it('doesnt more than the upper bound', () => {
    const src = '123456789'
    assertParser(parser, src, 0).succeeds(4, ['1', '2', '3', '4'])
  })

  it('fails it matches less than the lower bound', () => {
    const src = '12ab'
    assertParser(parser, src, 1).fails(1)
  })
})

describe('maybe0', () => {
  const parser = many0(num)

  it('succeedes if the original parser matches zero or more times in sequence', () => {
    const src = 'a-1-23-456'
    assertParser(parser, src, 0).succeeds(0, [])
    assertParser(parser, src, 2).succeeds(1, ['1'])
    assertParser(parser, src, 4).succeeds(2, ['2', '3'])
    assertParser(parser, src, 7).succeeds(3, ['4', '5', '6'])
  })
})

describe('maybe1', () => {
  const parser = many1(num)

  it('succeedes if the original parser matches one or more times in sequence', () => {
    const src = '1-23-456'
    assertParser(parser, src, 0).succeeds(1, ['1'])
    assertParser(parser, src, 2).succeeds(2, ['2', '3'])
    assertParser(parser, src, 5).succeeds(3, ['4', '5', '6'])
  })

  it('fails it doesnt match once', () => {
    const src = 'ab12'
    assertParser(parser, src, 0).fails()
  })
})
