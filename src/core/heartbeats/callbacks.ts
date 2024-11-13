import { TextDocumentChangeEvent } from "vscode";
import { Heartbeat } from "../types/heartbeat";

export const textDocumentChanged = (event: TextDocumentChangeEvent) => {
    const heartbeat: Heartbeat = {
        timestamp: Date.now(),
        eventType: "textDocumentChanged",
        filePath: event.document.uri.fsPath,
        fileName: event.document.fileName,
        lineCount: event.document.lineCount,
        changeCount: event.contentChanges.length,
        currentLanguage: event.document.languageId,
    };
    return heartbeat;
};

