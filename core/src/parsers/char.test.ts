import { describe, expect, it } from 'bun:test'

import { failure, move, repr, success } from '@/utils'

import { any, anyOf, anyIn, num, alpha, alphanum } from './char'

describe('any', () => {
  it('matches any character', () => {
    let ctx = { fileName: '', content: 'ab12.', offset: 0 }
    expect(repr(any(ctx))).toBe(repr(success(move(ctx, 1), 'a')))

    ctx = move(ctx, 1)
    expect(repr(any(ctx))).toBe(repr(success(move(ctx, 1), 'b')))

    ctx = move(ctx, 1)
    expect(repr(any(ctx))).toBe(repr(success(move(ctx, 1), '1')))

    ctx = move(ctx, 1)
    expect(repr(any(ctx))).toBe(repr(success(move(ctx, 1), '2')))

    ctx = move(ctx, 1)
    expect(repr(any(ctx))).toBe(repr(success(move(ctx, 1), '.')))

    ctx = move(ctx, 1)
    expect(repr(any(ctx))).toBe(repr(failure(ctx)))
  })
})

describe('anyOf', () => {
  const parser = anyOf('abc')

  it('matches any of the given characters', () => {
    let ctx = { fileName: '', content: 'abra cadabra', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), 'a')))

    ctx = move(ctx, 1)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), 'b')))

    ctx = move(ctx, 1)
    expect(repr(parser(ctx))).toBe(repr(failure(ctx)))

    ctx = { ...ctx, offset: 5 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), 'c')))

    ctx = move(ctx, 1)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), 'a')))

    ctx = move(ctx, 1)
    expect(repr(parser(ctx))).toBe(repr(failure(ctx)))
  })
})

describe('anyIn', () => {
  it('matches any in the given range of characters', () => {
    let parser = anyIn('am')

    let ctx = { fileName: '', content: 'ab12.', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), 'a')))

    ctx = move(ctx, 1)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), 'b')))

    ctx = move(ctx, 1)
    expect(repr(parser(ctx))).toBe(repr(failure(ctx)))

    parser = anyIn('09')

    ctx = { ...ctx, offset: 2 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), '1')))

    ctx = move(ctx, 1)
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 1), '2')))

    ctx = move(ctx, 1)
    expect(repr(parser(ctx))).toBe(repr(failure(ctx)))
  })
})

describe('num', () => {
  it('matches any ASCII numeric character', () => {
    let ctx = { fileName: '', content: '12ab.', offset: 0 }
    expect(repr(num(ctx))).toBe(repr(success(move(ctx, 1), '1')))

    ctx = move(ctx, 1)
    expect(repr(num(ctx))).toBe(repr(success(move(ctx, 1), '2')))

    ctx = move(ctx, 1)
    expect(repr(num(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(num(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(num(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(num(ctx))).toBe(repr(failure(ctx)))
  })
})

describe('alpha', () => {
  it('matches any ASCII alphabetic character', () => {
    let ctx = { fileName: '', content: 'ab12.', offset: 0 }
    expect(repr(alpha(ctx))).toBe(repr(success(move(ctx, 1), 'a')))

    ctx = move(ctx, 1)
    expect(repr(alpha(ctx))).toBe(repr(success(move(ctx, 1), 'b')))

    ctx = move(ctx, 1)
    expect(repr(alpha(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(alpha(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(alpha(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(alpha(ctx))).toBe(repr(failure(ctx)))
  })
})

describe('alphanum', () => {
  it('matches any ASCII alphanumeric character', () => {
    let ctx = { fileName: '', content: 'ab12.', offset: 0 }
    expect(repr(alphanum(ctx))).toBe(repr(success(move(ctx, 1), 'a')))

    ctx = move(ctx, 1)
    expect(repr(alphanum(ctx))).toBe(repr(success(move(ctx, 1), 'b')))

    ctx = move(ctx, 1)
    expect(repr(alphanum(ctx))).toBe(repr(success(move(ctx, 1), '1')))

    ctx = move(ctx, 1)
    expect(repr(alphanum(ctx))).toBe(repr(success(move(ctx, 1), '2')))

    ctx = move(ctx, 1)
    expect(repr(alphanum(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(alphanum(ctx))).toBe(repr(failure(ctx)))
  })
})
