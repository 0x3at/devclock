import {
	TextDocument,
	TextDocumentChangeEvent
} from "vscode";
import { Events } from "../../shared/types/events";
import { Heartbeat } from "../../shared/types/heartbeat";
import { CurrentTime } from "../../shared/utils/time";
import { DATASTORE } from "../../shared/constants/globalconstants";
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
