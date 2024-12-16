/** @format */

import {
	DebugSession,
	Disposable,
	FileCreateEvent,
	FileDeleteEvent,
	FileRenameEvent,
	TextDocument,
	TextDocumentChangeEvent,
	TextEditor,
	WorkspaceFoldersChangeEvent,
} from 'vscode';

export type VSCodeEventPayload =
	| TextDocumentChangeEvent
	| TextDocument
	| FileCreateEvent
	| FileDeleteEvent
	| FileRenameEvent
	| TextEditor
	| DebugSession
	| WorkspaceFoldersChangeEvent
	| undefined;
export type VSCodeEvent<T extends VSCodeEventPayload> = (
	callback: (arg: T) => void
) => Disposable;

export type EventLabel<T extends string> = T;
export type EventPayload = Record<string, any>;
export type EventCallback = (event: VSCodeEventPayload) => void;
