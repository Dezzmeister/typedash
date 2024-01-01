export type Reversed<S extends string> =
    S extends `${infer Head}${infer Tail}` ?
        `${Reversed<Tail>}${Head}` :
    '';
