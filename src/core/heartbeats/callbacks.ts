import {
	TextDocument,
	TextDocumentChangeEvent
} from "vscode";
import { Events } from "../types/events";
import { Heartbeat } from "../types/heartbeat";
import { CurrentTime } from "../utils/intUtils/time";
import { DATASTORE } from "../globalconstants";
type HeartbeatCreator = {
	withDocument: (doc: TextDocument, timestamp: number) => Heartbeat;
	withChange: (event: TextDocumentChangeEvent, timestamp: number) => Heartbeat;
	withoutDocument: (timestamp: number) => Heartbeat;
};

const createHeartbeatFactory = (eventType: Events): HeartbeatCreator => {
	const createBaseHeartbeat = (
		timestamp: number = CurrentTime("m")
	): Heartbeat => ({
		timestamp,
		eventType
	});
	const withDocument = (
		doc: TextDocument,
		timestamp: number
	): Heartbeat => ({
		...createBaseHeartbeat(timestamp),
		eventType: Events.coding,
		filePath: doc.uri.fsPath,
		fileName: doc.fileName,
		lineCount: doc.lineCount,
		currentLanguage: doc.languageId
	});
	const withChange = (
		event: TextDocumentChangeEvent,
		timestamp: number
	): Heartbeat => ({
		...createBaseHeartbeat(timestamp),
		filePath: event.document.uri.fsPath,
		fileName: event.document.fileName,
		lineCount: event.document.lineCount,
		changeCount: event.contentChanges.length,
		currentLanguage: event.document.languageId
	});
	const withoutDocument = (_?:any, timestamp: number = CurrentTime("m")): Heartbeat =>
		createBaseHeartbeat(timestamp);

	return { withDocument, withChange, withoutDocument,  };
};

const codingHeartbeat = createHeartbeatFactory(Events.coding);
const contentChangeHeartbeat = createHeartbeatFactory(Events.coding);
const debuggingHeartbeat = createHeartbeatFactory(Events.debugging);
const idleHeartbeat = createHeartbeatFactory(Events.idle);

export const contentHasChanged = (event: TextDocumentChangeEvent, timestamp: number = CurrentTime("m")) => {
	const heartbeat = contentChangeHeartbeat.withChange(event, timestamp);
	DATASTORE.addHeartbeat(heartbeat);
	return heartbeat;
};

export const fileHasChanged = (doc: TextDocument, timestamp: number = CurrentTime("m")) => {
	const heartbeat = codingHeartbeat.withDocument(doc, timestamp);
	DATASTORE.addHeartbeat(heartbeat);
	return heartbeat;
};

export const idleSignal = (timestamp: number = CurrentTime("m")) => {
	const heartbeat = idleHeartbeat.withoutDocument(timestamp);
	DATASTORE.addHeartbeat(heartbeat);
	return heartbeat;
};
export const debugHasChanged = (_:any, timestamp: number = CurrentTime("m")) => {
	const heartbeat = debuggingHeartbeat.withoutDocument(timestamp);
	DATASTORE.addHeartbeat(heartbeat);
	return heartbeat;
};

//!Deprecated
// export const textDocumentChanged = (
// 	event: TextDocumentChangeEvent,
// 	timestamp: number = CurrentTime("m")
// ): Heartbeat => {
// 	const heartbeat = {
// 		timestamp,
// 		eventType: Events.coding,
// 		filePath: event.document.uri.fsPath,
// 		fileName: event.document.fileName,
// 		lineCount: event.document.lineCount,
// 		changeCount: event.contentChanges.length,
// 		currentLanguage: event.document.languageId
// 	};
// 	console.log("Text Document Changed Heartbeat:", heartbeat);
// 	DATASTORE.addHeartbeat(heartbeat);
// 	return heartbeat;
// };

// export const documentOpened = (
// 	doc: TextDocument,
// 	timestamp: number = CurrentTime("m")
// ): Heartbeat => {
// 	const heartbeat = {
// 		timestamp,
// 		eventType: Events.coding,
// 		filePath: doc.uri.fsPath,
// 		fileName: doc.fileName,
// 		lineCount: doc.lineCount,
// 		currentLanguage: doc.languageId
// 	};
// 	console.log("Document Opened Heartbeat:", heartbeat);
// 	DATASTORE.addHeartbeat(heartbeat);
// 	return heartbeat;
// };

// export const documentClosed = (
// 	doc: TextDocument,
// 	timestamp: number = CurrentTime("m")
// ): Heartbeat => {
// 	const heartbeat = {
// 		timestamp,
// 		eventType: Events.coding,
// 		filePath: doc.uri.fsPath,
// 		fileName: doc.fileName,
// 		lineCount: doc.lineCount,
// 		currentLanguage: doc.languageId
// 	};
// 	console.log("Document Closed Heartbeat:", heartbeat);
// 	DATASTORE.addHeartbeat(heartbeat);
// 	return heartbeat;
// };

// export const documentSaved = (
// 	doc: TextDocument,
// 	timestamp: number = CurrentTime("m")
// ): Heartbeat => {
// 	const heartbeat = {
// 		timestamp,
// 		eventType: Events.coding,
// 		filePath: doc.uri.fsPath,
// 		fileName: doc.fileName,
// 		lineCount: doc.lineCount,
// 		currentLanguage: doc.languageId
// 	};
// 	console.log("Document Saved Heartbeat:", heartbeat);
// 	DATASTORE.addHeartbeat(heartbeat);
// 	return heartbeat;
// };

// export const configChanged = (
// 	_: ConfigurationChangeEvent,
// 	timestamp: number = CurrentTime("m")
// ): Heartbeat => {
// 	const heartbeat = {
// 		timestamp,
// 		eventType: Events.coding
// 	};
// 	console.log("Configuration Changed Heartbeat:", heartbeat);
// 	DATASTORE.addHeartbeat(heartbeat);
// 	return heartbeat;
// };

// export const debugStarted = (
// 	_: DebugSession,
// 	timestamp: number = CurrentTime("m")
// ): Heartbeat => {
// 	const heartbeat = {
// 		timestamp,
// 		eventType: Events.debugging
// 	};
// 	console.log("Debug Started Heartbeat:", heartbeat);
// 	DATASTORE.addHeartbeat(heartbeat);
// 	return heartbeat;
// };

// export const debugEnded = (
// 	_: DebugSession,
// 	timestamp: number = CurrentTime("m")
// ): Heartbeat => {
// 	const heartbeat = {
// 		timestamp,
// 		eventType: Events.debugging
// 	};
// 	console.log("Debug Ended Heartbeat:", heartbeat);
// 	DATASTORE.addHeartbeat(heartbeat);
// 	return heartbeat;
// };

// export const idleHeartbeat = () =>
// 	DATASTORE.addHeartbeat({ eventType: Events.idle, timestamp: Date.now() });
