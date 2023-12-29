import type { EmptyObject, UnknownRecord } from "type-fest"

export type Parser<T, TPayload extends UnknownRecord = EmptyObject> = (
    context: Readonly<ParseContext>
) => ParseResult<T, TPayload>

export type LazyParser<T, TPayload extends UnknownRecord = EmptyObject> =
    | (() => Parser<T, TPayload>)
    | Parser<T, TPayload>

export type ParserType<T extends LazyParser<unknown, UnknownRecord>> = T extends LazyParser<infer R>
    ? R
    : never

export type ParserPayloadType<T extends LazyParser<unknown, UnknownRecord>> = T extends LazyParser<
    unknown,
    infer R
>
    ? R
    : never

export interface Source {
    name: string
    path: string
    content: string
}

export type LocationRange = readonly [number, number]

export interface ParseContext {
    source: Source
    offset: number
    stacks?: StackMap
}

export type ParseResult<T, TPayload extends UnknownRecord = EmptyObject> =
    | ParseSuccess<T, TPayload>
    | ParseFailure

export type ParseSuccess<T, TPayload extends UnknownRecord = EmptyObject> = Readonly<{
    success: true
    value: T
    payload: TPayload
    loc: LocationRange
    next: ParseContext
}>

export type ParseFailure = Readonly<{
    success: false
    source: Source
    offset: number
    expected: string[]
}>

export type StackMap = Record<string, string[] | undefined>
