import { strict as assert } from 'node:assert'

import { Parser } from '@/types'

export function assertParser<T>(parser: Parser<T>, sourceContent: string, offset = 0) {
  let result = parser({ source: { name: '', path: '', content: sourceContent }, offset })

  return {
    succeeds(length: number, value: T): void {
      assert.ok(result.success, 'Expect parser to succeed, it failed instead')

      const actualLength = result.context.offset - offset
      assert.equal(
        actualLength,
        length,
        `Expected parser to match ${length} characters, it matched ${actualLength} instead.`
      )

      assert.deepEqual(
        result.value,
        value,
        `Expected parser to result in ${value}, it results in ${result.value} instead.`
      )
    },
    fails(after = 0, reason: string[] = []): void {
      assert.ok(!result.success, 'Expect parser to fail, it succeeded instead')

      const expectedPos = offset + after
      const actualPos = result.context.offset
      assert.equal(
        actualPos,
        expectedPos,
        `Expected parser to fail at ${expectedPos} characters, it failed at ${actualPos} instead.`
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
