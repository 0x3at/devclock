
type Subtract = (x:number, y:number) => number;
export const signedSubtract:Subtract = (x,y) => x-y;
export const absSubtract:Subtract = (x,y) => x>y? x-y : y-x;

type Add = (x:number, y:number) => number;
export const Add:Add = (x,y) => x+y;

type Increment = (x:number) => number;
export const Increment:Increment = (x) => x+1;

type Decrement = (x:number) => number;
export const Decrement:Decrement = (x) => x-1;

