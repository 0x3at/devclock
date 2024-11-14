type lastItem = <T>(items: T[]) => T | undefined;
export const lastItem: lastItem = <T>(items: T[]) => {
	return items.at(-1);
};

type valueOf = <T>(obj: T, key: keyof T) => T[keyof T];
export const valueOf: valueOf = <T>(obj: T, key: keyof T) => {
	return obj[key];
};
