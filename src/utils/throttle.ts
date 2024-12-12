/** @format */

import { TextDocumentContentChangeEvent } from 'vscode';

export function throttle<T extends (...args: any[]) => void>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let lastExecutionTime: number | null = null;
	return function (...args: Parameters<T>) {
		const now = Date.now();
		if (lastExecutionTime === null || now - lastExecutionTime >= limit) {
			func(...args);
			lastExecutionTime = now;
		}
	};
}

export function throttleKeepState<T extends (...args: any[]) => void>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let lastExecutionTime: number | null = null;
	let currentFile: string | null = null;
	let changeList: TextDocumentContentChangeEvent[] = [];
	return function (...args: Parameters<T>) {
		const now = Date.now();
		if (
			lastExecutionTime === null ||
			now - lastExecutionTime >= limit ||
			(currentFile && currentFile !== args[1].document.fileName)
		) {
			func(...args);
			lastExecutionTime = now;
			currentFile = null;
			changeList = [];
		} else {
			if (!currentFile) {
				currentFile = args[1]?.document.fileName;
				changeList.push(...args[1]?.contentChanges);
			} else {
				changeList.push(...args[1]?.contentChanges);
			}
		}
	};
}
