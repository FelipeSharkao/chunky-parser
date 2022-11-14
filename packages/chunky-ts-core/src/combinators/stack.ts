import produce from 'immer'

import { str } from '@/parsers'
import { ParseContext, Parser } from '@/types'
import { failure, success } from '@/utils'

import { raw } from './transform'

/**
 * Group of combinatos that stores the parsed text, allowing for complex, context-aware
 * syntaxes without requiring custom messy custom parsers
 */
export class StackGroup {
  constructor(readonly name: string) {}

  /* Creates a parser that adds the matched text to the top of the text */
  push(parser: Parser<any>): Parser<string> {
    return (ctx) => {
      const result = raw(parser)(ctx)
      if (result.success) {
        return produce(result, (draft) => {
          const stacks = draft.next.stacks || (draft.next.stacks = {})
          const array = stacks[this.name] || (stacks[this.name] = [])
          array.push(draft.value)
        })
      } else {
        return result
      }
    }
  }

  /*
   * Creates a parser that matches the text at the top of the stack, without removing it.
   */
  peek(): Parser<string>
  peek(at: number): Parser<string>
  peek(start: number, end: number): Parser<string>
  peek(start?: number, end?: number): Parser<string> {
    return (ctx) => {
      const array = ctx.stacks?.[this.name]
      if (!array?.length) return failure(ctx)
      const [_start, _end] = this.fixRange(ctx, start, end)
      const text = array.slice(_start, _end).join('')
      return str(text)(ctx)
    }
  }

  /*
   * Creates a parser that matches the text at the top of the stack, removing it,
   * fails if the stack is empty.
   */
  pop(): Parser<string>
  pop(at: number): Parser<string>
  pop(start: number, end: number): Parser<string>
  pop(start?: number, end?: number): Parser<string> {
    return (ctx) => {
      const result = this.peek(start as number, end as number)(ctx)
      if (result.success) {
        const { next } = this.drop(start as number, end as number)(ctx)
        return produce(result, (draft) => {
          const stacks = draft.next.stacks || (draft.next.stacks = {})
          stacks[this.name] = next.stacks?.[this.name] || []
        })
      }
      return result
    }
  }

  /*
   * Creates a parser that removes the item at the top of the stack, aways matches.
   */
  drop(): Parser<null>
  drop(at: number): Parser<null>
  drop(start: number, end: number): Parser<null>
  drop(start?: number, end?: number): Parser<null> {
    return (ctx) => {
      const [_start, _end] = this.fixRange(ctx, start, end)
      const next = produce(ctx, (draft) => {
        const array = draft.stacks?.[this.name]
        if (!array) return
        array.splice(_start, _end - _start)
      })
      return success(null, [ctx.offset, ctx.offset], next)
    }
  }

  private fixRange(ctx: ParseContext, start = 0, end = start) {
    const array = ctx.stacks?.[this.name] || []
    if (start < 0) start = array.length - start
    if (end < 0) end = array.length - end
    if (start > end) end = start
    return [array.length - end - 1, array.length - start] as const
  }
}
