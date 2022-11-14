import { describe, it } from 'bun:test'

import { many1, seq, StackGroup } from '@/combinators'
import { alpha, str } from '@/parsers'
import { ParseContext } from '@/types'
import { assertParser } from '@/utils'

describe('StackGroup', () => {
  const src = 'Foo Bar Quz Qux Bar Foo Quz Qux '
  const word = seq(many1(alpha), str(' '))

  describe('push', () => {
    it('matches and push the text to the stack', () => {
      const stack = new StackGroup('test')
      assertParser(stack.push(word), src).succeeds(4, 'Foo ')
    })

    it('fails if the original parser fails', () => {
      const stack = new StackGroup('test')
      assertParser(stack.push(word), src, 3).fails()
    })
  })

  describe('peek', () => {
    it('matches the text at the top of the stack', () => {
      const stack = new StackGroup('test')
      let ctx: ParseContext | string = src
      ctx = assertParser(stack.push(word), ctx, 0).succeeds(4, 'Foo ')
      ctx = assertParser(stack.push(word), ctx, 4).succeeds(4, 'Bar ')
      ctx = assertParser(stack.peek(), ctx, 16).succeeds(4, 'Bar ')
      assertParser(stack.peek(), ctx, 8).fails()
    })

    it('matches the text at the n-th position of the stack', () => {
      const stack = new StackGroup('test')
      let ctx: ParseContext | string = src
      ctx = assertParser(stack.push(word), ctx, 0).succeeds(4, 'Foo ')
      ctx = assertParser(stack.push(word), ctx, 4).succeeds(4, 'Bar ')
      ctx = assertParser(stack.peek(1), ctx, 20).succeeds(4, 'Foo ')
      assertParser(stack.peek(1), ctx, 8).fails()
    })

    it('matches the text at a range of the stack, from first inserted to last inserted', () => {
      const stack = new StackGroup('test')
      let ctx: ParseContext | string = src
      ctx = assertParser(stack.push(word), ctx, 8).succeeds(4, 'Quz ')
      ctx = assertParser(stack.push(word), ctx, 12).succeeds(4, 'Qux ')
      ctx = assertParser(stack.peek(0, 1), ctx, 24).succeeds(8, 'Quz Qux ')
      assertParser(stack.peek(0, 1), ctx, 4).fails()
    })

    it('fails if the stack is empty', () => {
      const stack = new StackGroup('test')
      assertParser(stack.peek(), src).fails()
    })

    it('does not removes the item matched from the stack', () => {
      const stack = new StackGroup('test')
      let ctx: ParseContext | string = src
      ctx = assertParser(stack.push(word), ctx, 0).succeeds(4, 'Foo ')
      ctx = assertParser(stack.push(word), ctx, 4).succeeds(4, 'Bar ')
      ctx = assertParser(stack.peek(), ctx, 4).succeeds(4, 'Bar ')
      ctx = assertParser(stack.peek(), ctx, 16).succeeds(4, 'Bar ')
      assertParser(stack.peek(), ctx, 20).fails()
    })
  })

  describe('pop', () => {
    it('matches the text at the top of the stack', () => {
      const stack = new StackGroup('test')
      let ctx: ParseContext | string = src
      ctx = assertParser(stack.push(word), ctx, 0).succeeds(4, 'Foo ')
      ctx = assertParser(stack.push(word), ctx, 4).succeeds(4, 'Bar ')
      ctx = assertParser(stack.pop(), ctx, 16).succeeds(4, 'Bar ')
      assertParser(stack.pop(), ctx, 8).fails()
    })

    it('matches the text at the n-th position of the stack', () => {
      const stack = new StackGroup('test')
      let ctx: ParseContext | string = src
      ctx = assertParser(stack.push(word), ctx, 0).succeeds(4, 'Foo ')
      ctx = assertParser(stack.push(word), ctx, 4).succeeds(4, 'Bar ')
      ctx = assertParser(stack.pop(1), ctx, 20).succeeds(4, 'Foo ')
    })

    it('matches the text at a range of the stack, from first inserted to last inserted', () => {
      const stack = new StackGroup('test')
      let ctx: ParseContext | string = src
      ctx = assertParser(stack.push(word), ctx, 8).succeeds(4, 'Quz ')
      ctx = assertParser(stack.push(word), ctx, 12).succeeds(4, 'Qux ')
      ctx = assertParser(stack.pop(0, 1), ctx, 24).succeeds(8, 'Quz Qux ')
      assertParser(stack.pop(0, 1), ctx, 4).fails()
    })

    it('fails if the stack is empty', () => {
      const stack = new StackGroup('test')
      assertParser(stack.pop(), src).fails()
    })

    it('removes the item matched from the stack', () => {
      const stack = new StackGroup('test')
      let ctx: ParseContext | string = src
      ctx = assertParser(stack.push(word), ctx, 0).succeeds(4, 'Foo ')
      ctx = assertParser(stack.push(word), ctx, 4).succeeds(4, 'Bar ')
      ctx = assertParser(stack.pop(), ctx, 16).succeeds(4, 'Bar ')
      ctx = assertParser(stack.pop(), ctx, 20).succeeds(4, 'Foo ')
    })

    it('does not remove the item if the parent parser fails', () => {
      const stack = new StackGroup('test')
      let ctx: ParseContext | string = src
      ctx = assertParser(stack.push(word), ctx, 0).succeeds(4, 'Foo ')
      ctx = assertParser(stack.peek(), ctx, 20).succeeds(4, 'Foo ')
      assertParser(seq(stack.pop(), str('!')), ctx, 20).fails(4)
      ctx = assertParser(stack.peek(), ctx, 20).succeeds(4, 'Foo ')
    })
  })
})
