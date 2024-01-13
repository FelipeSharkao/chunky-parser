export type Source = {
    readonly path: string
    readonly content: string
}

export type LocationRange = readonly [start: number, end: number]
