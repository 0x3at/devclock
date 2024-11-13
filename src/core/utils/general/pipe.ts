
type pipeTwo<A, B> = (input: A) => B;
export const pipeTwo = <A, B, C>(
    fn1: pipeTwo<A, B>,
    fn2: pipeTwo<B, C|undefined>
) => (input: A): C|undefined => fn2(fn1(input));

