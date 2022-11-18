/**
 * Intersection of every type in a union
 */
export type Intersection<T> = (T extends infer U ? (contravariant: U) => void : never) extends (
  intersection: infer I
) => void
  ? I
  : never
