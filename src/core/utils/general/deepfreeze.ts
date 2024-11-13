export const deepFreeze = <T extends object>(obj: T): Readonly<T> => {
    Object.keys(obj).forEach((property) => {
        const value = obj[property as keyof T];
        if (typeof value === "object" && value !== null && !Object.isFrozen(value)) {
            deepFreeze(value as object);
        }
    });
    return Object.freeze(obj);
};