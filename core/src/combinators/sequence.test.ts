import { describe, it, expect } from 'bun:test'

import { alpha, num } from '@/parsers'
import { failure, move, repr, success } from '@/utils'

import { seq, many, many0, many1 } from './sequence'

describe('seq', () => {
  const parser = seq(num, num, alpha)

  it('succeedes when all the original parsers matches in sequence', () => {
    const ctx = { fileName: '', content: '12ab', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 3), ['1', '2', 'a'])))
  })

  it('fails when any of the original parsers fails', () => {
    const ctx = { fileName: '', content: '12ab', offset: 1 }
    expect(repr(parser(ctx))).toBe(repr(failure(move(ctx, 1))))
  })
})

describe('many', () => {
  const parser = many(num, 2, 4)

  it('succeedes if the original parser matches N-M times in sequence', () => {
    let ctx = { fileName: '', content: '12-345-6789', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 2), ['1', '2'])))

    ctx = move(ctx, 3)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 3), ['3', '4', '5'])))

    ctx = move(ctx, 4)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 4), ['6', '7', '8', '9'])))
  })

  it('doesnt more than the upper bound', () => {
    const ctx = { fileName: '', content: '123456789', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 4), ['1', '2', '3', '4'])))
  })

  it('fails it matches less than the lower bound', () => {
    const ctx = { fileName: '', content: '12ab', offset: 1 }
    expect(repr(parser(ctx))).toBe(repr(failure(move(ctx, 1))))
  })
})

describe('maybe0', () => {
  const parser = many0(num)

  it('succeedes if the original parser matches zero or more times in sequence', () => {
    let ctx = { fileName: '', content: 'a-1-23-456', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(ctx, [])))

    ctx = move(ctx, 2)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), ['1'])))

    ctx = move(ctx, 2)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 2), ['2', '3'])))

    ctx = move(ctx, 3)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 3), ['4', '5', '6'])))
  })
})

describe('maybe1', () => {
  const parser = many1(num)

  it('succeedes if the original parser matches one or more times in sequence', () => {
    let ctx = { fileName: '', content: '1-23-456', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), ['1'])))

    ctx = move(ctx, 2)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 2), ['2', '3'])))

    ctx = move(ctx, 3)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 3), ['4', '5', '6'])))
  })

  it('fails it doesnt match once', () => {
    const ctx = { fileName: '', content: 'ab12', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(failure(ctx)))
  })
})
