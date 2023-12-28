import { describe, it } from 'bun:test'

import { assertParser } from '@/utils/testing'

import { str, re, unum, ualpha, ualphanum } from './text'

describe('str', () => {
  const parser = str('bana')

  it('matches a string literal', () => {
    const src = 'banana'
    assertParser(parser, src).succeeds(4, 'bana')
    assertParser(parser, src, 2).fails(0)
  })
})

describe('re', () => {
  const parser = re(/^bana/)

  it('matches a regex pattern', () => {
    const src = 'banana banana'
    assertParser(parser, src).succeeds(4, 'bana')
    assertParser(parser, src, 7).fails()
  })
})

describe('unum', () => {
  it('matches any unicode numeric character', () => {
    const src = '12ab.'
    assertParser(unum, src).succeeds(1, '1')
    assertParser(unum, src, 1).succeeds(1, '2')
    assertParser(unum, src, 2).fails()
    assertParser(unum, src, 3).fails()
    assertParser(unum, src, 4).fails()
    assertParser(unum, src, 5).fails()
  })
})

describe('ualpha', () => {
  it('matches any unicode alphabetic character', () => {
    const src = 'ab12.'
    assertParser(ualpha, src).succeeds(1, 'a')
    assertParser(ualpha, src, 1).succeeds(1, 'b')
    assertParser(ualpha, src, 2).fails()
    assertParser(ualpha, src, 3).fails()
    assertParser(ualpha, src, 4).fails()
    assertParser(ualpha, src, 5).fails()
  })
})

describe('ualphanum', () => {
  it('matches any unicode alphanumeric character', () => {
    const src = '12ab.'
    assertParser(unum, src).succeeds(1, '1')
    assertParser(unum, src, 1).succeeds(1, '2')
    assertParser(ualpha, src, 2).succeeds(1, 'a')
    assertParser(ualpha, src, 3).succeeds(1, 'b')
    assertParser(ualphanum, src, 4).fails()
    assertParser(ualphanum, src, 5).fails()
  })
})
