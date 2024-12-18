/** @format */

export function throttle<T extends (...args: any[]) => void>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let lastExecutionTime = 0;
	let timeoutId: NodeJS.Timeout | null = null;

	return function (...args: Parameters<T>) {
		const now = Date.now();
		const timeSinceLastExecution = now - lastExecutionTime;

		// Clear any existing timeout
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		if (lastExecutionTime === 0 || timeSinceLastExecution >= limit) {
			// Execute immediately on first call or if enough time has passed
			func(...args);
			lastExecutionTime = now;
		} else {
			// Schedule execution for when the limit is reached
			timeoutId = setTimeout(() => {
				func(...args);
				lastExecutionTime = Date.now();
				timeoutId = null;
			}, limit - timeSinceLastExecution);
		}
	};
}
