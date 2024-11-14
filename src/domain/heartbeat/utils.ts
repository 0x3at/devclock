type lastItem = <T>(items: T[]) => T | undefined;
export const lastItem: lastItem = <T>(items: T[]) => {
	return items.at(-1);
};
