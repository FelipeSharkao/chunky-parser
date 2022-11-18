import { strict as assert } from 'assert'
import { describe, it, expect } from 'bun:test'

import { label } from '@/combinators/named'
import { alpha, num } from '@/parsers'
import { assertParser } from '@/utils'

import { seq, many, many0, many1 } from './sequence'

describe('seq', () => {
  it('succeedes when all the original parsers matches in sequence', () => {
    const parser = seq(num, num, alpha)
    const src = '12ab'
    assertParser(parser, src, 0).succeeds(3, ['1', '2', 'a'])
  })

  it('fails when any of the original parsers fails', () => {
    const parser = seq(num, num, alpha)
    const src = '12ab'
    assertParser(parser, src, 1).fails(1)
  })

  it('merges the payload of every parser', () => {
    const parser = seq(label('num1', num), label('num2', num), label('alpha', alpha))
    const src = '12ab'
    const next = assertParser(parser, src, 0).succeeds(3, ['1', '2', 'a'])
    expect(next.payload.num1).toBe('1')
    expect(next.payload.num2).toBe('2')
    expect(next.payload.alpha).toBe('a')
  })
})

describe('many', () => {
  it('succeedes if the original parser matches N-M times in sequence', () => {
    const parser = many(num, 2, 4)
    const src = '12-345-6789'
    assertParser(parser, src, 0).succeeds(2, ['1', '2'])
    assertParser(parser, src, 3).succeeds(3, ['3', '4', '5'])
    assertParser(parser, src, 7).succeeds(4, ['6', '7', '8', '9'])
  })

  it('does not match more than the upper bound', () => {
    const parser = many(num, 2, 4)
    const src = '123456789'
    assertParser(parser, src, 0).succeeds(4, ['1', '2', '3', '4'])
  })

  it('fails it matches less than the lower bound', () => {
    const parser = many(num, 2, 4)
    const src = '12ab'
    assertParser(parser, src, 1).fails(1)
  })

  it('accumulates the payload into a arrays', () => {
    const parser = many(seq(label('a', num), label('b', num)), 2, 3)
    const src = '123456789'
    const next = assertParser(parser, src, 0).succeeds(6, [
      ['1', '2'],
      ['3', '4'],
      ['5', '6'],
    ])
    assert.deepEqual(next.payload, { a: ['1', '3', '5'], b: ['2', '4', '6'] })
  })
})

describe('many0', () => {
  const parser = many0(num)

  it('succeedes if the original parser matches zero or more times in sequence', () => {
    const src = 'a-1-23-456'
    assertParser(parser, src, 0).succeeds(0, [])
    assertParser(parser, src, 2).succeeds(1, ['1'])
    assertParser(parser, src, 4).succeeds(2, ['2', '3'])
    assertParser(parser, src, 7).succeeds(3, ['4', '5', '6'])
  })

  it('accumulates the payload into a arrays', () => {
    const parser = many0(seq(label('a', num), label('b', num)))
    const src = '123456789'
    const next = assertParser(parser, src, 0).succeeds(8, [
      ['1', '2'],
      ['3', '4'],
      ['5', '6'],
      ['7', '8'],
    ])
    assert.deepEqual(next.payload, { a: ['1', '3', '5', '7'], b: ['2', '4', '6', '8'] })
  })
})

describe('many1', () => {
  const parser = many1(num)

  it('succeedes if the original parser matches one or more times in sequence', () => {
    const src = '1-23-456'
    assertParser(parser, src, 0).succeeds(1, ['1'])
    assertParser(parser, src, 2).succeeds(2, ['2', '3'])
    assertParser(parser, src, 5).succeeds(3, ['4', '5', '6'])
  })

  it('fails it does not match once', () => {
    const src = 'ab12'
    assertParser(parser, src, 0).fails()
  })

  it('accumulates the payload into a arrays', () => {
    const parser = many1(seq(label('a', num), label('b', num)))
    const src = '123456789'
    const next = assertParser(parser, src, 0).succeeds(8, [
      ['1', '2'],
      ['3', '4'],
      ['5', '6'],
      ['7', '8'],
    ])
    assert.deepEqual(next.payload, { a: ['1', '3', '5', '7'], b: ['2', '4', '6', '8'] })
  })
})
