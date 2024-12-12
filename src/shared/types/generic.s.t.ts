/** @format */

import {
	DebugSession,
	Disposable,
	TextDocument,
	TextDocumentChangeEvent,
} from 'vscode';

export type VSCodeEventPayload =
	| TextDocumentChangeEvent
	| DebugSession
	| TextDocument;
export type VSCodeEvent<T extends VSCodeEventPayload> = (
	callback: (arg: T) => void
) => Disposable;

export type EventLabel<T extends string> = T;
export type EventPayload = Record<string, any> | VSCodeEventPayload;
export type EventCallback = (event: EventPayload) => void;
