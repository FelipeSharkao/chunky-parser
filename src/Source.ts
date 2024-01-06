export interface Source {
    name: string
    path: string
    content: string
}

export type LocationRange = readonly [start: number, end: number]
