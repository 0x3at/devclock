/** @format */

import { TextDocument } from 'vscode';

import { TextDocumentChangeEvent } from 'vscode';
import { EventData } from '../shared/types/generic.s.t';
import { FileStats, LanguageStat } from '../shared/types/details.s.t';
import { Session } from '../shared/types/session.s.t';
import { State } from '../shared/enums/state.s.e';

export const EventAdapter = (sessionManager: any) => {
	let getStats = (
		event: TextDocumentChangeEvent | TextDocument
	): { fileStats: FileStats; langStats: LanguageStat } => {
		const doc = 'document' in event ? event.document : event;

		return {
			fileStats: {
				fileName: doc.fileName.split('/').pop()!,
				filePath: doc.fileName,
				activeFileTime: 0,
				linesChanged:
					'contentChanges' in event
						? event.contentChanges.reduce(
								(acc: number, change: any) =>
									acc + change.rangeLength,
								0
						  )
						: 0,
				language: doc.languageId,
			},
			LanguageStat: {
				language: doc.languageId,
				activeTime: 0,
				changeCount: 0,
			},
		};
	};
	return {
		process: (event: EventData) => {
			if ((event as unknown as TextDocumentChangeEvent).contentChanges) {
				let details = getStats(
					event as unknown as TextDocumentChangeEvent
				);
				let session: Partial<Session> = {
					details: {
						fileStats: new Map([
							[details.fileStats.fileName, details.fileStats],
						]),
						langStats: new Map([
							[details.langStats.language, details.langStats],
						]),
					},
				};
				sessionManager.updateState(State.active);
			}
		},
	};
};
