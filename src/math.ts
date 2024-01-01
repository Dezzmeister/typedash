import type { Reversed } from "./string";
import type { Expect, Eq } from "./test";

type NextDigit = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
type Digit = NextDigit[number];
type DigitSum<T extends Digit, U extends Digit> = {
    '00': [0, 0];   '10': [0, 1];
    '01': [0, 1];   '11': [0, 2];
    '02': [0, 2];   '12': [0, 3];
    '03': [0, 3];   '13': [0, 4];
    '04': [0, 4];   '14': [0, 5];
    '05': [0, 5];   '15': [0, 6];
    '06': [0, 6];   '16': [0, 7];
    '07': [0, 7];   '17': [0, 8];
    '08': [0, 8];   '18': [0, 9];
    '09': [0, 9];   '19': [1, 0];
    '20': [0, 2];   '30': [0, 3];
    '21': [0, 3];   '31': [0, 4];
    '22': [0, 4];   '32': [0, 5];
    '23': [0, 5];   '33': [0, 6];
    '24': [0, 6];   '34': [0, 7];
    '25': [0, 7];   '35': [0, 8];
    '26': [0, 8];   '36': [0, 9];
    '27': [0, 9];   '37': [1, 0];
    '28': [1, 0];   '38': [1, 1];
    '29': [1, 1];   '39': [1, 2];
    '40': [0, 4];   '50': [0, 5];
    '41': [0, 5];   '51': [0, 6];
    '42': [0, 6];   '52': [0, 7];
    '43': [0, 7];   '53': [0, 8];
    '44': [0, 8];   '54': [0, 9];
    '45': [0, 9];   '55': [1, 0];
    '46': [1, 0];   '56': [1, 1];
    '47': [1, 1];   '57': [1, 2];
    '48': [1, 2];   '58': [1, 3];
    '49': [1, 3];   '59': [1, 4];
    '60': [0, 6];   '70': [0, 7];
    '61': [0, 7];   '71': [0, 8];
    '62': [0, 8];   '72': [0, 9];
    '63': [0, 9];   '73': [1, 0];
    '64': [1, 0];   '74': [1, 1];
    '65': [1, 1];   '75': [1, 2];
    '66': [1, 2];   '76': [1, 3];
    '67': [1, 3];   '77': [1, 4];
    '68': [1, 4];   '78': [1, 5];
    '69': [1, 5];   '79': [1, 6];
    '80': [0, 8];   '90': [0, 9];
    '81': [0, 9];   '91': [1, 0];
    '82': [1, 0];   '92': [1, 1];
    '83': [1, 1];   '93': [1, 2];
    '84': [1, 2];   '94': [1, 3];
    '85': [1, 3];   '95': [1, 4];
    '86': [1, 4];   '96': [1, 5];
    '87': [1, 5];   '97': [1, 6];
    '88': [1, 6];   '98': [1, 7];
    '89': [1, 7];   '99': [1, 8];
}[`${T}${U}`];

type DigitSumWithCarry<T extends Digit, U extends Digit, Carry extends 1 | 0> =
    Carry extends 0 ? DigitSum<T, U> :
    DigitSum<T, U> extends [infer C extends Digit, infer V extends Digit] ?
        V extends 9 ?
            [NextDigit[C], 0] :
            [C, NextDigit[V]]
    : never;

type WithTrailingZeroes<T extends string, U extends string> = 
    [T, U] extends [`${infer THead}${infer TTail}`, `${infer UHead}${infer UTail}`] ?
        WithTrailingZeroes<TTail, UTail> extends [infer TPadded extends string, infer UPadded extends string] ?
            [`${THead}${TPadded}`, `${UHead}${UPadded}`] :
        never :
    [T, U] extends ['', ''] ?
        [T, U] :
    [T, U] extends ['', `${string}${string}`] ?
        WithTrailingZeroes<`${T}0`, U> :
    WithTrailingZeroes<T, `${U}0`>;

type SumImpl<T extends string, U extends string, Carry extends 0 | 1 = 0> =
    [T, U] extends [`${infer THead extends Digit}${infer TTail}`, `${infer UHead extends Digit}${infer UTail}`] ?
        DigitSumWithCarry<THead, UHead, Carry> extends [infer NextCarry extends 0 | 1, infer Res extends Digit] ?
            `${Res}${SumImpl<TTail, UTail, NextCarry>}` :
        '' :
    Carry extends 1 ? '1' : '';

/**
 * Computes the sum of two natural numbers of arbitrary size. Uses string manipulation and
 * base-10 arithmetic instead of recursive tuples, so the time complexity is linear in the average
 * number of digits of the operands, and the space complexity is constant.
 */
export type Sum<T extends number, U extends number> =
    WithTrailingZeroes<Reversed<`${T}`>, Reversed<`${U}`>> extends [infer TNum extends string, infer UNum extends string] ?
        Reversed<SumImpl<TNum, UNum>> extends `${infer Res extends number}` ?
            Res :
        never :
    never;

// @ts-ignore (unused)
type _test = [
    Expect<Eq<Sum<0, 0>, 0>>,
    Expect<Eq<Sum<1, 0>, 1>>,
    Expect<Eq<Sum<0, 1>, 1>>,
    Expect<Eq<Sum<5, 4>, 9>>,
    Expect<Eq<Sum<4, 5>, 9>>,
    Expect<Eq<Sum<0, 1_000_000_000>, 1_000_000_000>>,
    Expect<Eq<Sum<1_000_000_000, 0>, 1_000_000_000>>,
    Expect<Eq<Sum<999_999_999, 1>, 1_000_000_000>>,
    Expect<Eq<Sum<1, 999_999_999>, 1_000_000_000>>,
    Expect<Eq<Sum<99, 10>, 109>>,
    Expect<Eq<Sum<10, 99>, 109>>,
    Expect<Eq<Sum<1001, 110>, 1111>>,
    Expect<Eq<Sum<1001, 1000>, 2001>>,
    Expect<Eq<Sum<1001, 999>, 2000>>
];
