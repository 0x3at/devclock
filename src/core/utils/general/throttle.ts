export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {
    let lastExecutionTime: number | null = null;

    return function (...args: Parameters<T>) {
        const now = Date.now();
        if (lastExecutionTime === null || now - lastExecutionTime >= limit) {
            func(...args);
            lastExecutionTime = now;
        }
    };
}
