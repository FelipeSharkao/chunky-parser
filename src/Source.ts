export type Source = {
    name: string
    readonly path: string
    readonly content: string
}

export type LocationRange = readonly [start: number, end: number]
