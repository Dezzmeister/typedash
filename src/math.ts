import type { Reversed } from "./string";
import type { Expect, Eq, Not } from "./test";

type NextDigit = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
type Digit = NextDigit[number];

/**
 * Lookup table for single digit sums. Each value in the table has a shape like [Carry, Sum].
 */
type DigitSumMap = {
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
};

/**
 * Lookup table for single digit products. The products are reversed, because they are
 * eventually passed into `SumImpl` (which expects numbers to be reversed).
 */
type DigitMulMap = {
    '00': '00';     '10': '00';
    '01': '00';     '11': '10';
    '02': '00';     '12': '20';
    '03': '00';     '13': '30';
    '04': '00';     '14': '40';
    '05': '00';     '15': '50';
    '06': '00';     '16': '60';
    '07': '00';     '17': '70';
    '08': '00';     '18': '80';
    '09': '00';     '19': '90';
    '20': '00';     '30': '00';
    '21': '20';     '31': '30';
    '22': '40';     '32': '60';
    '23': '60';     '33': '90';
    '24': '80';     '34': '21';
    '25': '01';     '35': '51';
    '26': '21';     '36': '81';
    '27': '41';     '37': '12';
    '28': '61';     '38': '42';
    '29': '81';     '39': '72';
    '40': '00';     '50': '00';
    '41': '40';     '51': '50';
    '42': '80';     '52': '01';
    '43': '21';     '53': '51';
    '44': '61';     '54': '02';
    '45': '02';     '55': '52';
    '46': '42';     '56': '03';
    '47': '82';     '57': '53';
    '48': '23';     '58': '04';
    '49': '63';     '59': '54';
    '60': '00';     '70': '00';
    '61': '60';     '71': '70';
    '62': '21';     '72': '41';
    '63': '81';     '73': '12';
    '64': '42';     '74': '82';
    '65': '03';     '75': '53';
    '66': '63';     '76': '24';
    '67': '24';     '77': '94';
    '68': '84';     '78': '65';
    '69': '45';     '79': '36';
    '80': '00';     '90': '00';
    '81': '80';     '91': '90';
    '82': '61';     '92': '81';
    '83': '42';     '93': '72';
    '84': '23';     '94': '63';
    '85': '04';     '95': '54';
    '86': '84';     '96': '45';
    '87': '65';     '97': '36';
    '88': '46';     '98': '27';
    '89': '27';     '99': '18';
};

type DigitNinesComplement = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];

// Returns the sum of two base-10 digits, and the carry. The shape of the result is
// [Sum extends Digit, Carry extends 0 | 1]
type DigitSum<T extends Digit, U extends Digit> = DigitSumMap[`${T}${U}`];

// Two-digit adder with carry
type DigitSumWithCarry<T extends Digit, U extends Digit, Carry extends 1 | 0> =
    Carry extends 0 ? DigitSum<T, U> :
    DigitSum<T, U> extends [infer C extends Digit, infer V extends Digit] ?
        V extends 9 ?
            [NextDigit[C], 0] :
            [C, NextDigit[V]]
    : never;

type NinesComplement<T extends string> = 
    T extends `${infer Head extends Digit}${infer Tail}` ?
        `${DigitNinesComplement[Head]}${NinesComplement<Tail>}` :
    '';

// Converts a positive number (as a string) to a negative, but not
// vice-versa
type ToNegative<T extends string> = 
    `-${T}` extends `${infer N extends number}` ?
        N :
    never;

type WithoutSign<T extends string> =
    T extends `-${infer Rest extends string}` ?
        [1, Rest] :
    [0, T];

/**
 * Pads the shorter of two strings with trailing zeroes until the strings are the same
 * length.
 */
type WithTrailingZeroes<T extends string, U extends string> = 
    [T, U] extends [`${infer THead}${infer TTail}`, `${infer UHead}${infer UTail}`] ?
        WithTrailingZeroes<TTail, UTail> extends [infer TPadded extends string, infer UPadded extends string] ?
            [`${THead}${TPadded}`, `${UHead}${UPadded}`] :
        never :
    [T, U] extends ['', ''] ?
        [T, U] :
    [T, U] extends ['', string] ?
        WithTrailingZeroes<`${T}0`, U> :
    WithTrailingZeroes<T, `${U}0`>;

type WithoutLeadingZeroes<T extends string> =
    T extends ('0' | '00') ? '0' :
    T extends `${infer Head}${infer Tail}` ?
        Head extends '0' ? WithoutLeadingZeroes<Tail> : T :
    '';

type NumOrDefault<T extends string> =
    T extends '' ? '0' : T;

type IsZero<T extends string> =
    T extends '0' ? true :
    T extends `0${infer Tail}` ?
        IsZero<Tail> :
    false;

/**
 * Sums two natural numbers by summing each corresponding pair of digits and the carry from the sum
 * of the previous pair. Note that T and U are expected to be reversed - i.e. Sum<"0008", "413"> is
 * actually computing the sum of 8000 and 314. This is because of the way Typescript matches strings
 * to consecutive inferred types. For example, given `${infer TTail}${infer THead extends Digit}`,
 * Typescript will match at most 1 char to TTail before giving up and failing to match, even if the template
 * literal might match if TTail had more than 1 char. "tail9" won't match, but "t9" will, even though both
 * should be valid. We could also split the digits of a number into a tuple type and match the last one that way, but
 * working with strings is easier because they can be cleaned and converted back to numbers in one step.
 */
type SumImpl<T extends string, U extends string, Carry extends 0 | 1 = 0> =
    [T, U] extends [`${infer THead extends Digit}${infer TTail}`, `${infer UHead extends Digit}${infer UTail}`] ?
        DigitSumWithCarry<THead, UHead, Carry> extends [infer NextCarry extends 0 | 1, infer Res extends Digit] ?
            `${Res}${SumImpl<TTail, UTail, NextCarry>}` :
        '' :
    Carry extends 1 ? '1' : '';

/**
 * Computes the sum of two numbers with the same number of digits. The overflow bit is set if the result would
 * add another digit. The shape of the result is [Sum extends string, Overflow extends 0 | 1]. T and U must have
 * the same length.
 */
type SumImplWithOverflow<T extends string, U extends string, Carry extends 0 | 1 = 0> =
    [T, U] extends [`${infer THead extends Digit}${infer TTail}`, `${infer UHead extends Digit}${infer UTail}`] ?
        DigitSumWithCarry<THead, UHead, Carry> extends [infer NextCarry extends 0 | 1, infer Res extends Digit] ?
            SumImplWithOverflow<TTail, UTail, NextCarry> extends [infer Sum extends string, infer Overflow] ?
                [`${Res}${Sum}`, Overflow] :
            ['', Carry] :
        ['', Carry] :
    ['', Carry];

/**
 * Decompose a floating point number (represented a string) into the whole part and the fractional part.
 * Either part can be empty. The shape of the result is
 * [Whole extends string, Frac extends string]
 */
type FloatParts<T extends string> =
    T extends `${infer Head extends number | '.'}${infer Tail extends string}` ?
        Head extends '.' ?
            ['', Tail] :
        FloatParts<Tail> extends [infer TailLeft extends string, infer TailRight extends string] ?
            [`${Head}${TailLeft}`, TailRight] :
        ['', ''] :
    ['', ''];

type CleanedFloatStr<
    WholePart extends string,
    FracPart extends string,
> = IsZero<FracPart> extends true ? Reversed<WholePart> : Reversed<`${FracPart}.${WholePart}`>;

/**
 * In addition to putting the whole and fractional parts together, we need to make sure that a rule is followed
 * in order to extract a numeric literal from the result string. The rule is that Typescript will only infer a narrowed
 * type from a string literal if conversion from the narrowed type to a string produces the same string. Otherwise, Typescript
 * will infer the more general type. This means that you cannot infer `1.0` from the string '1.0', because conversion from
 * 1.0 to a string produces the string '1'. We need to make sure that `FloatStr` in this type is something that we
 * can infer a number literal from.
 */
type CleanedFloat<
    WholePart extends string,
    FracPart extends string,
    FloatStr extends string = CleanedFloatStr<WholePart, FracPart>
> =
    FloatStr extends `${infer Res extends number}` ?
        Res :
    never;

/**
 * Each of the parts (T, U) X (whole, frac) can be empty. This is unacceptable for addition, so the empty strings need to be replaced
 * with '0' by NumOrDefault. The whole parts are reversed* here, but the fractional parts cannot be reversed until we have added
 * trailing zeroes to make them the same length. Then we can reverse the fractional parts and add them up. We need the overflow,
 * because it is used as the carry when we add the whole numbers. Finally, we can get the whole and fractional sums and
 * clean them up so that they can be converted into a numeric literal type.
 *
 * *Note: We add two numbers by converting them to strings and going character-by-character. It would be convenient to be
 * able to infer the last character off of the string in constant time, but we can't do that; we can only infer
 * the first character with something like `T extends `${infer Char}${infer Tail}`. In this situation, Typescript does the
 * simple thing and matches `Char` to only 1 character, and `Tail` to the rest. This means that we have to reverse the whole
 * number parts to put the least significant digits at the start of the string.
 */
type SumFloatsImpl<TWholeRaw extends string, TFracRaw extends string, UWholeRaw extends string, UFracRaw extends string> =
    [Reversed<NumOrDefault<TWholeRaw>>, NumOrDefault<TFracRaw>, Reversed<NumOrDefault<UWholeRaw>>, NumOrDefault<UFracRaw>] extends [infer TWholeR extends string, infer TFracF extends string, infer UWholeR extends string, infer UFracF extends string] ?
        [WithTrailingZeroes<TWholeR, UWholeR>, WithTrailingZeroes<TFracF, UFracF>] extends [[infer TWholeRZ extends string, infer UWholeRZ extends string], [infer TFracFZ extends string, infer UFracFZ extends string]] ?
            [Reversed<TFracFZ>, Reversed<UFracFZ>] extends [infer TFracRZ extends string, infer UFracRZ extends string] ?
                SumImplWithOverflow<TFracRZ, UFracRZ> extends [infer FracSum extends string, infer FracCarry extends 0 | 1] ?
                    SumImpl<TWholeRZ, UWholeRZ, FracCarry> extends infer WholeSum extends string ?
                        CleanedFloat<WholeSum, FracSum> :
                    never :
                never :
            never :
        never :
    never;

/**
 * Computes the sum of two natural numbers of arbitrary size.
 */
export type SumNats<T extends number, U extends number> =
    WithTrailingZeroes<Reversed<`${T}`>, Reversed<`${U}`>> extends [infer TNum extends string, infer UNum extends string] ?
        Reversed<SumImpl<TNum, UNum>> extends `${infer Res extends number}` ?
            Res :
        never :
    never;

type SumNatArrayImpl<Ts extends string[]> =
    Ts extends [infer T] ?
        T :
    Ts extends [infer T extends string, ...infer Rest extends string[]] ?
        SumNatArrayImpl<Rest> extends infer Sum extends string ?
            WithTrailingZeroes<T, Sum> extends [infer TNum extends string, infer RNum extends string] ?
                SumImpl<TNum, RNum> :
            never :
        never :
    never;
 
/**
 * Computes the sum of two floating point numbers of arbitrary size.
 */
export type SumFloats<T extends number, U extends number> =
    [FloatParts<`${T}`>, FloatParts<`${U}`>] extends [[infer TWholeRaw extends string, infer TFracRaw extends string], [infer UWholeRaw extends string, infer UFracRaw extends string]] ?
        SumFloatsImpl<TWholeRaw, TFracRaw, UWholeRaw, UFracRaw> :
    never;

/**
 * Computes the sum of two non-negative numbers. Uses string manipulation to implement base-10 addition.
 * This type delegates to the internal implementations of `SumNats` or `SumFloats` depending on the type of number passed
 * in. SumFloats can handle the general case, but SumNats is more efficient for integers.
 */
export type Sum<T extends number, U extends number> =
    [FloatParts<`${T}`>, FloatParts<`${U}`>] extends [[infer TWholeRaw extends string, infer TFracRaw extends string], [infer UWholeRaw extends string, infer UFracRaw extends string]] ?
        [TFracRaw, UFracRaw] extends ['', ''] ?
            WithTrailingZeroes<Reversed<TWholeRaw>, Reversed<UWholeRaw>> extends [infer TNum extends string, infer UNum extends string] ?
                Reversed<SumImpl<TNum, UNum>> extends `${infer Res extends number}` ?
                    Res :
                never :
            never :
        SumFloatsImpl<TWholeRaw, TFracRaw, UWholeRaw, UFracRaw> :
    never;

/**
 * Computes the difference between two natural numbers. The result will be negative if T is greater than U.
 * This is implemented by taking the nine's complement of U and adding it to T, much like binary subtraction.
 */
export type DiffNats<T extends number, U extends number> = 
    WithTrailingZeroes<Reversed<`${T}`>, Reversed<`${U}`>> extends [infer Minuend extends string, infer Subtrahend extends string] ?
        SumImplWithOverflow<NinesComplement<Minuend>, Subtrahend> extends [infer RawSum extends string, infer Carry extends 0 | 1] ?
            // The result is positive
            Carry extends 0 ?
                WithoutLeadingZeroes<NinesComplement<Reversed<RawSum>>> extends `${infer Res extends number}` ?
                    Res :
                never :
            // The result is negative
            WithTrailingZeroes<RawSum, '1'> extends [infer RawSum2R extends string, infer Carry2 extends string] ?
                ToNegative<WithoutLeadingZeroes<Reversed<SumImpl<RawSum2R, Carry2>>>> :
            never :
        never :
    never;

type MulDigit<Digit extends string, N extends string, Zeroes extends string = ""> =
    N extends `${infer NC}${infer NRest}` ?
        `${Digit}${NC}` extends keyof DigitMulMap ?
            DigitMulMap[`${Digit}${NC}`] extends infer DigitMulRes extends string ?
                [`${Zeroes}${DigitMulRes}`, ...MulDigit<Digit, NRest, `0${Zeroes}`>] :
            never :
        never :
    [];

type DoMul<Top extends string, Btm extends string, Zeroes extends string = ""> =
    Btm extends `${infer Digit}${infer Rest}` ?
        [...MulDigit<Digit, Top, Zeroes>, ...DoMul<Top, Rest, `0${Zeroes}`>] :
    [];

/**
 * This works by multiplying each digit of T with each digit of U and shifting the correct amount
 * of zeroes onto each result. The results are summed to form the product of T and U.
 *
 * Example: 12 * 201
 * (2*1) + (2*0)0 + (2*2)00 +
 * (1*1)0 + (1*0)00 + (1*2)000 =
 * 2 + 00 + 400 + 10 + 000 + 2000 =
 * 2412
 */
type MulIntsImpl<T extends string, U extends string> = 
    DoMul<T, U> extends infer Products extends string[] ?
        SumNatArrayImpl<Products> :
    never;

export type MulInts<T extends number, U extends number> =
    // Bail out early so that we don't have to deal with "-0" later on
    0 extends T | U ? 0 :
    [WithoutSign<`${T}`>, WithoutSign<`${U}`>] extends [[infer TSign extends 0 | 1, infer TStr extends string], [infer USign extends 0 | 1, infer UStr extends string]] ?
        [Reversed<TStr>, Reversed<UStr>] extends [infer TRev extends string, infer URev extends string] ?
            `${TSign extends USign ? '' : '-'}${WithoutLeadingZeroes<Reversed<MulIntsImpl<TRev, URev>>>}` extends `${infer Result extends number}` ?
                Result :
            never :
        never :
    never;

// @ts-ignore (unused)
type _test = [
    Expect<Eq<SumNats<0, 0>, 0>>,
    Expect<Eq<SumNats<1, 0>, 1>>,
    Expect<Eq<SumNats<0, 1>, 1>>,
    Expect<Eq<SumNats<5, 4>, 9>>,
    Expect<Eq<SumNats<4, 5>, 9>>,
    Expect<Eq<SumNats<0, 1_000_000_000>, 1_000_000_000>>,
    Expect<Eq<SumNats<1_000_000_000, 0>, 1_000_000_000>>,
    Expect<Eq<SumNats<999_999_999, 1>, 1_000_000_000>>,
    Expect<Eq<SumNats<1, 999_999_999>, 1_000_000_000>>,
    Expect<Eq<SumNats<99, 10>, 109>>,
    Expect<Eq<SumNats<10, 99>, 109>>,
    Expect<Eq<SumNats<1001, 110>, 1111>>,
    Expect<Eq<SumNats<1001, 1000>, 2001>>,
    Expect<Eq<SumNats<1001, 999>, 2000>>,

    Expect<Eq<DiffNats<0, 0>, 0>>,
    Expect<Eq<DiffNats<1, 0>, 1>>,
    Expect<Eq<DiffNats<0, 1>, -1>>,
    Expect<Eq<DiffNats<1, 1>, 0>>,
    Expect<Eq<DiffNats<9, 5>, 4>>,
    Expect<Eq<DiffNats<9, 4>, 5>>,
    Expect<Eq<DiffNats<4, 9>, -5>>,
    Expect<Eq<DiffNats<5, 9>, -4>>,
    Expect<Eq<DiffNats<1_000_000_000, 0>, 1_000_000_000>>,
    Expect<Eq<DiffNats<1_000_000_000, 1_000_000_000>, 0>>,
    Expect<Eq<DiffNats<1_000_000_000, 999_999_999>, 1>>,
    Expect<Eq<DiffNats<1_000_000_000, 1>, 999_999_999>>,
    Expect<Eq<DiffNats<999_999_999, 1_000_000_000>, -1>>,
    Expect<Eq<DiffNats<1, 1_000_000_000>, -999_999_999>>,
    Expect<Eq<DiffNats<109, 99>, 10>>,
    Expect<Eq<DiffNats<109, 10>, 99>>,
    Expect<Eq<DiffNats<10, 109>, -99>>,
    Expect<Eq<DiffNats<99, 109>, -10>>,
    Expect<Eq<DiffNats<1111, 1001>, 110>>,
    Expect<Eq<DiffNats<1111, 110>, 1001>>,
    Expect<Eq<DiffNats<1001, 1111>, -110>>,
    Expect<Eq<DiffNats<110, 1111>, -1001>>,
    Expect<Eq<DiffNats<2001, 1001>, 1000>>,
    Expect<Eq<DiffNats<2001, 1000>, 1001>>,
    Expect<Eq<DiffNats<1001, 2001>, -1000>>,
    Expect<Eq<DiffNats<1000, 2001>, -1001>>,
    Expect<Eq<DiffNats<2000, 1001>, 999>>,
    Expect<Eq<DiffNats<2000, 999>, 1001>>,
    Expect<Eq<DiffNats<1001, 2000>, -999>>,
    Expect<Eq<DiffNats<999, 2000>, -1001>>,

    // Ensure that SumFloats handles SumNats cases properly
    Expect<Eq<SumFloats<0, 0>, 0>>,
    Expect<Eq<SumFloats<1, 0>, 1>>,
    Expect<Eq<SumFloats<0, 1>, 1>>,
    Expect<Eq<SumFloats<5, 4>, 9>>,
    Expect<Eq<SumFloats<4, 5>, 9>>,
    Expect<Eq<SumFloats<0, 1_000_000_000>, 1_000_000_000>>,
    Expect<Eq<SumFloats<1_000_000_000, 0>, 1_000_000_000>>,
    Expect<Eq<SumFloats<999_999_999, 1>, 1_000_000_000>>,
    Expect<Eq<SumFloats<1, 999_999_999>, 1_000_000_000>>,
    Expect<Eq<SumFloats<99, 10>, 109>>,
    Expect<Eq<SumFloats<10, 99>, 109>>,
    Expect<Eq<SumFloats<1001, 110>, 1111>>,
    Expect<Eq<SumFloats<1001, 1000>, 2001>>,
    Expect<Eq<SumFloats<1001, 999>, 2000>>,

    // Ensure that SumFloats handles floats correctly
    Expect<Eq<SumFloats<0., 0>, 0>>,
    Expect<Eq<SumFloats<0, 0.>, 0>>,
    Expect<Eq<SumFloats<1., 1.>, 2>>,
    Expect<Eq<SumFloats<1., 1.1>, 2.1>>,
    Expect<Eq<SumFloats<.99, .01>, 1>>,
    Expect<Eq<SumFloats<.99, .1>, 1.09>>,
    Expect<Eq<SumFloats<49.1234, .0007>, 49.1241>>,
    Expect<Eq<SumFloats<1.99, 99.99>, 101.98>>,
    Expect<Eq<SumFloats<0.00001, 0.00001>, 0.00002>>,
    Expect<Eq<SumFloats<18753.123000045, 50.0034003>, 18803.126400345>>,
    Expect<Eq<SumFloats<99.99, 99.99>, 199.98>>,

    // Ensure that Sum handles all cases correctly
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
    Expect<Eq<Sum<1001, 999>, 2000>>,
    Expect<Eq<Sum<0., 0>, 0>>,
    Expect<Eq<Sum<0, 0.>, 0>>,
    Expect<Eq<Sum<1., 1.>, 2>>,
    Expect<Eq<Sum<1., 1.1>, 2.1>>,
    Expect<Eq<Sum<.99, .01>, 1>>,
    Expect<Eq<Sum<.99, .1>, 1.09>>,
    Expect<Eq<Sum<49.1234, .0007>, 49.1241>>,
    Expect<Eq<Sum<1.99, 99.99>, 101.98>>,
    Expect<Eq<Sum<0.00001, 0.00001>, 0.00002>>,
    Expect<Eq<Sum<18753.123000045, 50.0034003>, 18803.126400345>>,
    Expect<Eq<Sum<99.99, 99.99>, 199.98>>,

    Expect<Eq<MulInts<0, 0>, 0>>,
    Expect<Eq<MulInts<1, 1>, 1>>,
    Expect<Eq<MulInts<3, 3>, 9>>,
    Expect<Eq<MulInts<20, 20>, 400>>,
    Expect<Eq<MulInts<100, 100>, 10000>>,
    Expect<Eq<MulInts<-2, -2>, 4>>,
    Expect<Eq<MulInts<-5, -5>, 25>>,
    Expect<Eq<MulInts<-31, -31>, 961>>,
    Expect<Eq<MulInts<-50, -50>, 2500>>,
    Expect<Eq<MulInts<2, -2>, -4>>,
    Expect<Eq<MulInts<-5, 5>, -25>>,
    Expect<Eq<MulInts<31, -31>, -961>>,
    Expect<Eq<MulInts<-50, 50>, -2500>>,
    Expect<Eq<MulInts<1_103_193_456, 17_898>, 19_744_956_475_488>>,
    Expect<Eq<MulInts<-1_103_193_456, 17_898>, -19_744_956_475_488>>,
    Expect<Eq<MulInts<1_103_193_456, -17_898>, -19_744_956_475_488>>,
    Expect<Eq<MulInts<-1_103_193_456, -17_898>, 19_744_956_475_488>>,
    Expect<Eq<MulInts<17_898, 1_103_193_456>, 19_744_956_475_488>>,
    Expect<Eq<MulInts<-17_898, 1_103_193_456>, -19_744_956_475_488>>,
    Expect<Eq<MulInts<17_898, -1_103_193_456>, -19_744_956_475_488>>,
    Expect<Eq<MulInts<-17_898, -1_103_193_456>, 19_744_956_475_488>>,

    Expect<Eq<WithTrailingZeroes<'1', '0005'>, ['1000', '0005']>>,
    Expect<Eq<WithTrailingZeroes<'19', '123456'>, ['190000', '123456']>>,
    Expect<Eq<WithoutLeadingZeroes<'00'>, '0'>>,
    Expect<Eq<WithoutLeadingZeroes<'0'>, '0'>>,
    Expect<Eq<WithoutLeadingZeroes<'000000'>, '0'>>,
    Expect<Eq<WithoutLeadingZeroes<'1000'>, '1000'>>,
    Expect<Eq<WithoutLeadingZeroes<'0001000'>, '1000'>>,
    Expect<Eq<WithoutLeadingZeroes<'145143'>, '145143'>>,
    Expect<Eq<WithoutLeadingZeroes<''>, ''>>,

    Expect<Eq<FloatParts<'1'>, ['1', '']>>,
    Expect<Eq<FloatParts<'1.0'>, ['1', '0']>>,
    Expect<Eq<FloatParts<'0.0'>, ['0', '0']>>,
    Expect<Eq<FloatParts<'123.456'>, ['123', '456']>>,
    Expect<Eq<FloatParts<'90.123456'>, ['90', '123456']>>,
    Expect<Eq<FloatParts<'.909'>, ['', '909']>>,
    Expect<Eq<FloatParts<'909.'>, ['909', '']>>,

    Expect<IsZero<'0'>>,
    Expect<IsZero<'00'>>,
    Expect<IsZero<'00000'>>,
    Expect<Not<IsZero<''>>>,
    Expect<Not<IsZero<'1'>>>,
    Expect<Not<IsZero<'100000'>>>,
    Expect<Not<IsZero<'00001'>>>,
    Expect<Not<IsZero<'010'>>>,
    Expect<Not<IsZero<'000010000'>>>
];
