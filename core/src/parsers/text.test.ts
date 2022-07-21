import { describe, expect, it } from 'bun:test'

import { failure, move, repr, success } from '@/utils'

import { str, re, unum, ualpha, ualphanum } from './text'

describe('str', () => {
  const parser = str('bana')

  it('matches a string literal', () => {
    let ctx = { fileName: '', content: 'banana', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 4), 'bana')))

    ctx = { ...ctx, offset: 2 }
    expect(repr(parser(ctx))).toBe(repr(failure(ctx)))
  })
})

describe('re', () => {
  const parser = re(/^bana/)

  it('matches a regex pattern', () => {
    let ctx = { fileName: '', content: 'banana banana', offset: 0 }
    expect(repr(parser(ctx))).toBe(repr(success(move(ctx, 4), 'bana')))

    ctx = { ...ctx, offset: 7 }
    expect(repr(parser(ctx))).toBe(repr(failure(ctx)))
  })
})

describe('unum', () => {
  it('matches any unicode numeric character', () => {
    let ctx = { fileName: '', content: '12ab.', offset: 0 }
    expect(repr(unum(ctx))).toBe(repr(success(move(ctx, 1), '1')))

    ctx = move(ctx, 1)
    expect(repr(unum(ctx))).toBe(repr(success(move(ctx, 1), '2')))

    ctx = move(ctx, 1)
    expect(repr(unum(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(unum(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(unum(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(unum(ctx))).toBe(repr(failure(ctx)))
  })
})

describe('ualpha', () => {
  it('matches any unicode alphabetic character', () => {
    let ctx = { fileName: '', content: 'ab12.', offset: 0 }
    expect(repr(ualpha(ctx))).toBe(repr(success(move(ctx, 1), 'a')))

    ctx = move(ctx, 1)
    expect(repr(ualpha(ctx))).toBe(repr(success(move(ctx, 1), 'b')))

    ctx = move(ctx, 1)
    expect(repr(ualpha(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(ualpha(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(ualpha(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(ualpha(ctx))).toBe(repr(failure(ctx)))
  })
})

describe('ualphanum', () => {
  it('matches any unicode alphanumeric character', () => {
    let ctx = { fileName: '', content: '12ab.', offset: 0 }
    expect(repr(unum(ctx))).toBe(repr(success(move(ctx, 1), '1')))

    ctx = move(ctx, 1)
    expect(repr(unum(ctx))).toBe(repr(success(move(ctx, 1), '2')))

    ctx = move(ctx, 1)
    expect(repr(ualpha(ctx))).toBe(repr(success(move(ctx, 1), 'a')))

    ctx = move(ctx, 1)
    expect(repr(ualpha(ctx))).toBe(repr(success(move(ctx, 1), 'b')))

    ctx = move(ctx, 1)
    expect(repr(ualphanum(ctx))).toBe(repr(failure(ctx)))

    ctx = move(ctx, 1)
    expect(repr(ualphanum(ctx))).toBe(repr(failure(ctx)))
  })
})
