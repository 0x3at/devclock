export const curryThree = (fn1: any, fn2: any, fn3: any) => (input: any) => {
	let heartbeat = fn1(input);
	fn2(heartbeat);
	fn3();
};
