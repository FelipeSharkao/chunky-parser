import type { ParseFailure, ParseSuccess } from "@/ParseResult"
import type { Source } from "@/Source"
import type { StackGroup } from "@/combinators/stack"

/** @internal */
export type StackMap = Map<StackGroup, string[]>

export interface ParseContext {
    /** @internal */
    test?: string
    /** @internal */
    stacks?: StackMap
}

/**
 * Represents a input for a parser. It references a point in the source text being parsed without
 * copying it, and contains the context of the previous parsers
 */
export class ParseInput {
    constructor(
        readonly source: Source,
        public offset: number,
        public context: ParseContext
    ) {}

    clone(): ParseInput {
        return new ParseInput(this.source, this.offset, structuredClone(this.context))
    }

    /**
     * Returns a string containing the next `n` characters from the source text
     */
    take(n: number): string {
        if (n <= 0) {
            return ""
        }

        if (n === 1) {
            return this.source.content[this.offset]
        }

        return this.source.content.slice(this.offset, this.offset + n)
    }

    /**
     * Returns true if the source text at the offset starts with `search`
     */
    startsWith(search: string): boolean {
        return this.source.content.startsWith(search, this.offset)
    }

    /**
     * Executes a regex on the source text at the offset. The regex will only search for a match at
     * the offset, as if it had the `y` flag, and the `g` flag will be ignored. The original regex
     * object will not be modified, and it's `lastIndex` will be ignored
     */
    matches(regex: RegExp): RegExpExecArray | null {
        const _regex = new RegExp(regex.source, regex.flags.replace("g", "") + "y")
        _regex.lastIndex = this.offset
        return _regex.exec(this.source.content)
    }

    /**
     * Returns a ParseSuccess from the current input
     */
    success<T>(opts: SuccessOptions<T>): ParseSuccess<T> {
        return {
            success: true,
            value: opts.value,
            loc: [opts.start ?? this.offset, opts.end ?? this.offset + (opts.length || 0)],
        }
    }

    /**
     * Returns a ParseFailure from the current input
     */
    failure(opts: FailureOptions): ParseFailure {
        return {
            success: false,
            source: this.source,
            offset: opts.offset ?? this.offset + (opts.move || 0),
            expected: opts.expected,
        }
    }

    /**
     * Returns the length of the source text after the offset
     */
    get length(): number {
        return this.source.content.length - this.offset
    }
}

/**
 * Options for creating a ParseSuccess
 */
type SuccessOptions<T> = {
    /**
     * The parsed value
     */
    value: T
    /**
     * The start of the parsed value. Defaults to the current offset of the input
     */
    start?: number
    /**
     * The end of the parsed value. Defaults to the current offset of the input
     */
    end?: number
    /**
     *  The length of the parsed value. Will be ignored if `end` is specified
     */
    length?: number
}

/**
 * Options for creating a ParseFailure
 */
type FailureOptions = {
    /**
     * An array of strings representing what kind of input was expected
     */
    expected: string[]
    /**
     * The offset to use for the failure. Defaults to the current offset of the input
     */
    offset?: number
    /**
     * The amount of characters to move the offset. Will be ignored if `offset` is specified
     */
    move?: number
}
