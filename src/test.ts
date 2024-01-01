/**
 * Determines if two types are structurally equal. Fails for 'any', but handles object
 * intersections properly.
 */
export type EqStructural<T, U> =
    [T] extends [U] ?
        [U] extends [T] ? true : false :
    false;

/**
 * Determines if two types are equal according to an internal Typescript check that
 * is triggered when a generic parameter in a conditional type is not bound (in this case,
 * `R`). The internal check treats mapped types and intersection types differently, even if they
 * are structurally equal, although it can distinguish between `any` and other types.
 */
export type EqInternal<T, U> =
    (<R>() => R extends T ? 0 : 1) extends
    (<R>() => R extends U ? 0 : 1) ? true : false;

export type Eq<T, U> =
    [EqInternal<T, any>, EqInternal<U, any>] extends [false, false] ?
        EqStructural<T, U> :
    EqInternal<T, U>;

export type Expect<Cond extends true> = Cond;

export type Not<Cond extends boolean> =
    Cond extends true ? false : true;

// @ts-ignore (unused)
type _test = [
    Expect<Eq<1, 1>>,
    Expect<Not<Eq<1, 2>>>,
    Expect<Eq<1 | 2 | 3, 3 | 2 | 1>>,
    Expect<Not<Eq<1 | 2 | 3, 1 | 2>>>,
    Expect<Eq<any, any>>,
    Expect<Not<Eq<any, unknown>>>,
    Expect<Eq<[1, 2, 3], [1, 2, 3]>>,
    Expect<Eq<never, never>>,
    Expect<Not<Eq<never, unknown>>>,
    Expect<Not<Eq<any, never>>>,
    Expect<Eq<{ a: 1 } & { b: 2 }, { a: 1; b: 2 }>>,
];
