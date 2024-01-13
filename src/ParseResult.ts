import type { LocationRange, Source } from "@/Source"

export type ParseResult<T> = ParseSuccess<T> | ParseFailure

export type ParseSuccess<T> = {
    readonly success: true
    value: T
    loc: LocationRange
}

export type ParseFailure = {
    readonly success: false
    readonly source: Source
    offset: number
    expected: string[]
}
