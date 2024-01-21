export type ParseResult<T> = ParseSuccess<T> | ParseFailure

export type ParseSuccess<T> = {
    readonly success: true
    value: T
    loc: LocationRange
}

export type ParseFailure = {
    readonly success: false
    offset: number
    expected: string[]
}

export type LocationRange = readonly [start: number, end: number]
