import { strict as assert } from 'node:assert'
import { inspect } from 'node:util'

import { ParseContext, Parser } from '@/types'

export function assertParser<T>(parser: Parser<T>, ctx: string | ParseContext, offset = 0) {
  if (typeof ctx == 'string') {
    ctx = { source: { name: '', path: '', content: ctx }, offset }
  } else {
    ctx = { ...ctx, offset }
  }
  let result = parser(ctx)

  return {
    succeeds(length: number, value: T): ParseContext {
      assert.ok(
        result.success,
        `Expect parser to succeed with value ${inspect(value)}, it failed instead`
      )

      const actualLength = result.next.offset - offset
      assert.equal(
        actualLength,
        length,
        `Expected parser to match ${length} characters, it matched ${actualLength} instead.`
      )

      assert.deepEqual(
        result.value,
        value,
        `Expected parser to result in ${inspect(value)}, it results in ${result.value} instead.`
      )

      return result.next
    },
    fails(after = 0, reason: string[] = []): void {
      assert.ok(!result.success, 'Expect parser to fail, it succeeded instead')

      const expectedPos = offset + after
      const actualPos = result.next.offset
      assert.equal(
        actualPos,
        expectedPos,
        `Expected parser to fail at character ${expectedPos}, it failed at ${actualPos} instead.`
      )

      const expectedReason = new Set(reason)
      const actualReason = new Set(result.expected)
      const format = (v: Set<string>) => (v.size ? `[{${Array.from(v).join(', ')}}` : 'undefined')
      assert.deepEqual(
        actualReason,
        expectedReason,
        `Expected failed parser to be ${format(expectedReason)}, it was ${format(
          actualReason
        )} instead.`
      )
    },
  }
}
