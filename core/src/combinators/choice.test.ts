import { describe, expect, it } from 'bun:test'

import { str } from '@/parsers'
import { failure, move, repr, success } from '@/utils'

import { not, oneOf, optional, predicate } from './choice'

describe('optional', () => {
  const parser = optional(str('bana'))

  it('results null instead of failing', () => {
    let ctx = { fileName: '', content: 'banana', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 4), 'bana')))

    ctx = { ...ctx, offset: 2 }
    expect(repr(parser(ctx))).toBe(repr(success(ctx, null)))
  })
})

describe('predicate', () => {
  const parser = predicate(str('bana'))

  it('matches without moving the context', () => {
    let ctx = { fileName: '', content: 'banana', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(ctx, 'bana')))
  })

  it('fails when the original parser fails', () => {
    let ctx = { fileName: '', content: 'banana', offset: 2 }
    expect(repr(parser(ctx))).toBe(repr(failure(ctx)))
  })
})

describe('not', () => {
  const parser = not(str('bana'))

  it('fails when the original parser succeede', () => {
    let ctx = { fileName: '', content: 'banana', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(failure(ctx)))
  })

  it('succeede when the original parser fails', () => {
    let ctx = { fileName: '', content: 'banana', offset: 2 }
    expect(repr(parser(ctx))).toBe(repr(success(ctx, null)))
  })
})

describe('oneOf', () => {
  const parser = oneOf(str('bana'), str('nana'))

  it('matches when any of parsers matches', () => {
    let ctx = { fileName: '', content: 'banana', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 4), 'bana')))

    ctx = { ...ctx, offset: 2 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 4), 'nana')))
  })

  it('fails when all of the original parser fails', () => {
    let ctx = { fileName: '', content: 'banana', offset: 4 }
    expect(repr(parser(ctx))).toBe(repr(failure(ctx)))
  })

  it('matches the first parser that matches in ambigous cases', () => {
    const parser = oneOf(str('an'), str('anan'))
    let ctx = { fileName: '', content: 'banana', offset: 1 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 2), 'an')))
  })
})
