import type { ParseContext } from "@/ParseInput"
import type { LocationRange, Source } from "@/Source"

export type ParseResult<T> = ParseSuccess<T> | ParseFailure

export type ParseSuccess<T> = Readonly<{
    success: true
    value: T
    loc: LocationRange
    next: ParseContext
}>

export type ParseFailure = Readonly<{
    success: false
    source: Source
    offset: number
    expected: string[]
}>
