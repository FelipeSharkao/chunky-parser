import produce from 'immer'

import { failure, ParseContext, Parser, raw, str, success } from '@chunky/core'

/**
 * Group of combinators that stores the parsed text, allowing for complex, context-aware syntaxes
 */
export class StackGroup {
  constructor(readonly name: string) {}

  /**
   * Creates a parser that adds the matched text to the top of the text
   */
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

  /**
   * Creates a parser that matches the text at the top of the stack, without removing it. Fails if the stack is empty
   */
  peek(): Parser<string>
  /**
   * Creates a parser that matches the text of a item of the stack, without removing it. Fails if the stack is empty
   *
   * @arg at - The index of the item. If a negative number is passed, it will select the item from the bottom of the stack
   */
  peek(at: number): Parser<string>
  /**
   * Creates a parser that matches the text in a slice of the stack, without removing it. Fails if the stack is empty
   *
   * @arg start - The start of the slice, inclusive. If a negative number is passed, it will select the item from the bottom of the stack
   * @arg end - The end of the slice, inclusive. If a negative number is passed, it will select the item from the bottom of the stack
   */
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

  /**
   * Creates a parser that matches the text at the top of the stack, removing it. Fails if the stack is empty
   */
  pop(): Parser<string>
  /**
   * Creates a parser that matches the text of a item of the stack, removing it. Fails if the stack is empty
   *
   * @arg at - The index of the item. If a negative number is passed, it will select the item from the bottom of the stack
   */
  pop(at: number): Parser<string>
  /**
   * Creates a parser that matches the text in a slice of the stack, removing it. Fails if the stack is empty
   *
   * @arg start - The start of the slice, inclusive. If a negative number is passed, it will select the item from the bottom of the stack
   * @arg end - The end of the slice, inclusive. If a negative number is passed, it will select the item from the bottom of the stack
   */
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

  /**
   * Creates a parser that removes the item at the top of the stack
   */
  drop(): Parser<null>
  /**
   * Creates a parser that removes a item of the stack
   *
   * @arg at - The index of the item to be removed. If a negative number is passed, it will select the item from the bottom of the stack
   */
  drop(at: number): Parser<null>
  /**
   * Creates a parser that removes a slice of the stack
   *
   * @arg start - The start of the slice, inclusive. If a negative number is passed, it will select the item from the bottom of the stack
   * @arg end - The end of the slice, inclusive. If a negative number is passed, it will select the item from the bottom of the stack
   */
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
