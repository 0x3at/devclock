/** @format */
export function debounce<T extends (...args: any[]) => void>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timer: ReturnType<typeof setTimeout> | null = null;

	return function (...args: Parameters<T>) {
		if (!timer) {
			func(...args);
		} else {
			clearTimeout(timer);
		}

		timer = setTimeout(() => {
			timer = null;
			func(...args);
		}, delay);
	};
}

export function debounceState<T extends (...args: any[]) => void>(
	func: T,
	delay: number
): (...args: Parameters<T>) => void {
	let timer: ReturnType<typeof setTimeout> | null = null;
	return function (...args: Parameters<T>) {
		if (timer) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			timer = null;
			func(...args);
		}, delay);
	};
}
