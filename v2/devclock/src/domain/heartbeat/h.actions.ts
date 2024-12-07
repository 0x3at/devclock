import { DebugSession, TextDocument, TextDocumentChangeEvent } from "vscode";
import { Heartbeat } from "../../shared/types/heartbeat";
import { Events } from "../../shared/types/events";
type args = {
	textDoc?: TextDocument;
	textDocChangeEvent?: TextDocumentChangeEvent;
	debugSession?: DebugSession;
};
export const HeartBeatBuilder = (eventData: args) => {
	switch (true) {
		case eventData.textDoc !== undefined:
			let dataC1: Heartbeat = {
				timestamp: Date.now(),
				eventType: Events.coding,
				filePath: eventData.textDoc.uri.fsPath,
				fileName: eventData.textDoc.fileName,
				lineCount: eventData.textDoc.lineCount,
				currentLanguage: eventData.textDoc.languageId
			};
			return dataC1;
		case eventData.textDocChangeEvent !== undefined:
			let dataC2 = {
				timestamp: Date.now(),
				eventType: Events.coding,
				filePath: eventData.textDocChangeEvent.document.uri.fsPath,
				fileName: eventData.textDocChangeEvent.document.fileName,
				lineCount: eventData.textDocChangeEvent.document.lineCount,
				changeCount: eventData.textDocChangeEvent.contentChanges.length,
				currentLanguage:
					eventData.textDocChangeEvent.document.languageId
			};
			return dataC2;
		case eventData.debugSession !== undefined:
			let dataC3 = {
				timestamp: Date.now(),
				eventType: Events.debugging
			};
			return dataC3;
		default:
			let dataC4 = {
				timestamp: Date.now(),
				eventType: Events.coding
			};
			return dataC4;
	}
};
