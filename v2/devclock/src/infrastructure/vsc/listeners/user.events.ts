import {
	debug,
	DebugSession,
	Disposable,
	TextDocument,
	TextDocumentChangeEvent,
	workspace as ws
} from "vscode";
import { throttle } from "../../../utils/throttle";
import { HeartBeatBuilder } from "../../../domain/heartbeat/h.actions";
import { AppPreferences } from '../../../shared/const/settings';

export type Listener = {
	pause: () => void;
	resume: () => void;
	disposable: Disposable;
};
type VSCodeEvent<T> = (callback: (arg: T) => void) => Disposable;

const createListener = <T>(
	event: VSCodeEvent<T>,
	callback: (arg: T) => void,
): Listener => {
	const throttledCallback = throttle(callback, parseInt(AppPreferences.throttleTime.get()));
	let disposable = event(throttledCallback);

	return {
		pause: () => disposable.dispose(),
		resume: () => {
			disposable = event(callback);
		},
		disposable
	};
};

//! Push the Heartbeat to the datastore
const withEvent = (event: TextDocumentChangeEvent) => {
	let args = {
		textDoc: undefined,
		textDocChangeEvent: event,
		debugSession: undefined
	};
	let heartbeat = HeartBeatBuilder(args);
};

const withDebug = (session: DebugSession) => {
	let args = {
		textDoc: undefined,
		textDocChangeEvent: undefined,
		debugSession: session
	};
	let heartbeat = HeartBeatBuilder(args);
};

const withDoc = (doc: TextDocument) => {
	let args = {
		textDoc: doc,
		textDocChangeEvent: undefined,
		debugSession: undefined
	};
	let heartbeat = HeartBeatBuilder(args);
};
const _default = () => {
	let args = {
		textDoc: undefined,
		textDocChangeEvent: undefined,
		debugSession: undefined
	};
	let heartbeat = HeartBeatBuilder(args);
};
export const textChanged = () =>
	createListener(ws.onDidChangeTextDocument, withEvent);
export const docOpened = () =>
	createListener(ws.onDidOpenTextDocument, withDoc);
export const docClosed = () =>
	createListener(ws.onDidCloseTextDocument, withDoc);
export const docSaved = () =>
	createListener(ws.onDidSaveTextDocument, withDoc);
export const debugStart = () =>
	createListener(debug.onDidStartDebugSession, withDebug);
export const debugEnd = () =>
	createListener(debug.onDidTerminateDebugSession, _default);

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
