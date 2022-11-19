/**
 * Intersection of every type in a union
 */
export type Intersection<T> = (T extends infer U ? (contravariant: U) => void : never) extends (
  intersection: infer I
) => void
  ? I
  : never

/**
 * Assigns the properties of `U` to `T`. Mirrors the behavior of `Object.assign` or object spread
 */
// This could be simpler, but this way is better for handling unions, and avoid using intersections
export type Assign<T, U> = T extends any
  ? U extends any
    ? { [K in keyof T | keyof U]: K extends keyof U ? U[K] : K extends keyof T ? T[K] : never }
    : never
  : never
