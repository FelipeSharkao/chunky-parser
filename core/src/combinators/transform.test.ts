import { describe, expect, it } from 'bun:test'

import { num } from '@/parsers'
import { failure, move, repr, success } from '@/utils'

import { map, raw } from './transform'

describe('map', () => {
  it('transforms the output of a parser', () => {
    const parser = map(num, (value) => Number(value))
    let ctx = { fileName: '', content: '12', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), 1)))

    ctx = move(ctx, 1)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), 2)))
  })

  it('fails when the original parser fails', () => {
    const parser = map(num, (value) => Number(value))
    let ctx = { fileName: '', content: '1a', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), 1)))

    ctx = move(ctx, 1)
    expect(repr(parser(ctx))).toBe(repr(failure(ctx)))
  })
})

describe('raw', () => {
  it('discards the parser value and results the original text', () => {
    const parser = raw(map(num, (value) => Number(value)))
    let ctx = { fileName: '', content: '12', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), '1')))

    ctx = move(ctx, 1)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), '2')))
  })

  it('fails when the original parser fails', () => {
    const parser = raw(map(num, (value) => Number(value)))
    let ctx = { fileName: '', content: '1a', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), '1')))

    ctx = move(ctx, 1)
    expect(repr(parser(ctx))).toBe(repr(failure(ctx)))
  })
})
