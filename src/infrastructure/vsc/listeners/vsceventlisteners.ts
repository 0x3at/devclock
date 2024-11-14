import { debug, Disposable, workspace as ws } from "vscode";
import {
	contentHasChanged,
	fileHasChanged,
	debugHasChanged
} from "../../../domain/heartbeat/actions";
import { throttle } from "../../../shared/utils/throttle";

export type Listener = {
	pause: () => void;
	resume: () => void;
	disposable: Disposable;
};

type VSCodeEvent<T> = (callback: (arg: T) => void) => Disposable;

const createListener = <T>(
	event: VSCodeEvent<T>,
	callback: (arg: T) => void,
	throttleTime: number
): Listener => {
	const throttledCallback = throttle(callback, throttleTime);
	let disposable = event(throttledCallback);

	return {
		pause: () => disposable.dispose(),
		resume: () => {
			disposable = event(callback);
		},
		disposable
	};
};

export const textChanged = () =>
	createListener(ws.onDidChangeTextDocument, contentHasChanged, 0);
export const docOpened = () =>
	createListener(ws.onDidOpenTextDocument, fileHasChanged, 10000);
export const docClosed = () =>
	createListener(ws.onDidCloseTextDocument, fileHasChanged, 10000);
export const docSaved = () =>
	createListener(ws.onDidSaveTextDocument, fileHasChanged, 10000);
export const debugStart = () =>
	createListener(debug.onDidStartDebugSession, debugHasChanged, 10000);
export const debugEnd = () =>
	createListener(debug.onDidTerminateDebugSession, debugHasChanged, 10000);

export const Listeners = () => {
	return [
		textChanged(),
		docOpened(),
		docClosed(),
		docSaved(),
		debugStart(),
		debugEnd()
	];
};

	//TODO: Implement this
	// export const configChange = () =>
// 	createListener(ws.onDidChangeConfiguration, configHasChanged, 10000);
