/**
 * A natural number, from 0 (inclusive) to the maximum positive whole number
 * that can be represented by the `number` type. Theoretically a very large number
 * can be represented by Nat, but in practice the Typescript compiler does not allow
 * a tuple to be too large, or a type to recurse too deeply.
 */
export type Nat = 0[];

type ToNatImpl<N extends number, C extends 0[] = []> =
    C['length'] extends N ? C :
    ToNatImpl<N, [...C, 0]>;

export type ToNat<N extends number> = ToNatImpl<N>;
