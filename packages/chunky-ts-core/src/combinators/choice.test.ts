import { describe, expect, it } from 'bun:test'

import { label } from '@/combinators/named'
import { str } from '@/parsers'
import { assertParser } from '@/utils'

import { not, oneOf, optional, predicate } from './choice'

describe('optional', () => {
  const parser = optional(str('bana'))

  it('results undefined instead of failing', () => {
    const src = 'banana'
    assertParser(parser, src, 0).succeeds(4, 'bana')
    assertParser(parser, src, 2).succeeds(0, undefined)
  })
})

describe('predicate', () => {
  it('matches without moving the context', () => {
    const parser = predicate(str('bana'))
    const src = 'banana'
    assertParser(parser, src, 0).succeeds(0, 'bana')
  })

  it('keeps the payload of the original parser', () => {
    const parser = predicate(label('str', str('bana')))
    const src = 'banana'
    const next = assertParser(parser, src, 0).succeeds(0, 'bana')
    expect(next.payload.str).toBe('bana')
  })

  it('fails when the original parser fails', () => {
    const parser = predicate(str('bana'))
    const src = 'banana'
    assertParser(parser, src, 2).fails()
  })
})

describe('not', () => {
  const parser = not(str('bana'))

  it('fails when the original parser succeede', () => {
    const src = 'banana'
    assertParser(parser, src, 0).fails()
  })

  it('succeede when the original parser fails', () => {
    const src = 'banana'
    assertParser(parser, src, 2).succeeds(0, null)
  })
})

describe('oneOf', () => {
  const parser = oneOf(str('bana'), str('nana'))

  it('matches when any of parsers matches', () => {
    const src = 'banana'
    assertParser(parser, src, 0).succeeds(4, 'bana')
    assertParser(parser, src, 2).succeeds(4, 'nana')
  })

  it('fails when all of the original parser fails', () => {
    const src = 'banana'
    assertParser(parser, src, 4).fails()
  })

  it('matches the first parser that matches in ambigous cases', () => {
    const parser = oneOf(str('an'), str('anan'))
    const src = 'banana'
    assertParser(parser, src, 1).succeeds(2, 'an')
  })
})
