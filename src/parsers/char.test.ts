import { describe, it } from 'bun:test'

import { assertParser } from '@/utils/testing'

import { any, anyOf, anyIn, num, alpha, alphanum } from './char'

describe('any', () => {
  it('matches any character', () => {
    const src = 'ab12.'
    assertParser(any, src).succeeds(1, 'a')
    assertParser(any, src, 1).succeeds(1, 'b')
    assertParser(any, src, 2).succeeds(1, '1')
    assertParser(any, src, 3).succeeds(1, '2')
    assertParser(any, src, 4).succeeds(1, '.')
    assertParser(any, src, 5).fails()
  })
})

describe('anyOf', () => {
  const parser = anyOf('abc')

  it('matches any of the given characters', () => {
    const src = 'abra cadabra'
    assertParser(parser, src).succeeds(1, 'a')
    assertParser(parser, src, 1).succeeds(1, 'b')
    assertParser(parser, src, 2).fails()
    assertParser(parser, src, 5).succeeds(1, 'c')
    assertParser(parser, src, 6).succeeds(1, 'a')
    assertParser(parser, src, 7).fails()
  })
})

describe('anyIn', () => {
  it('matches any in the given range of characters', () => {
    let parser = anyIn('am')

    const src = 'ab12.'
    assertParser(parser, src).succeeds(1, 'a')
    assertParser(parser, src, 1).succeeds(1, 'b')
    assertParser(parser, src, 2).fails()
    parser = anyIn('09')

    assertParser(parser, src, 2).succeeds(1, '1')
    assertParser(parser, src, 3).succeeds(1, '2')
    assertParser(parser, src, 4).fails()
  })
})

describe('num', () => {
  it('matches any ASCII numeric character', () => {
    const src = '12ab.'
    assertParser(num, src).succeeds(1, '1')
    assertParser(num, src, 1).succeeds(1, '2')
    assertParser(num, src, 2).fails()
    assertParser(num, src, 3).fails()
    assertParser(num, src, 4).fails()
    assertParser(num, src, 5).fails()
  })
})

describe('alpha', () => {
  it('matches any ASCII alphabetic character', () => {
    const src = 'ab12.'
    assertParser(alpha, src).succeeds(1, 'a')
    assertParser(alpha, src, 1).succeeds(1, 'b')
    assertParser(alpha, src, 2).fails()
    assertParser(alpha, src, 3).fails()
    assertParser(alpha, src, 4).fails()
    assertParser(alpha, src, 5).fails()
  })
})

describe('alphanum', () => {
  it('matches any ASCII alphanumeric character', () => {
    const src = 'ab12.'
    assertParser(alphanum, src).succeeds(1, 'a')
    assertParser(alphanum, src, 1).succeeds(1, 'b')
    assertParser(alphanum, src, 2).succeeds(1, '1')
    assertParser(alphanum, src, 3).succeeds(1, '2')
    assertParser(alphanum, src, 4).fails()
    assertParser(alphanum, src, 5).fails()
  })
})
