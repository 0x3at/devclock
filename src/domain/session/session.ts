/** @format */
import { TextDocument, workspace as ws } from 'vscode';
import { AppDetails } from '../../shared/settings';
import { Session } from '../../shared/types/session.s.t';

const Session = () => {
	let _session: Session = {
		appName: AppDetails.appName,
		sessionID: AppDetails.sessionID,
		startTime: AppDetails.startTime,
		duration: Date.now() - AppDetails.startTime,
		activeTime: Date.now() - AppDetails.startTime,
		debugTime: 0,
		idleTime: 0,
		details: {
			files: new Map(),
			langs: new Map(),
		},
	};

	const getDetails = () => {
		ws.textDocuments.map((doc: TextDocument) => {
			_session.details.files.set(doc.fileName, {
				fileName: doc.fileName.split('/').pop()!,
				filePath: doc.fileName,
				isActive: false,
				activeFileTime: 0,
				startingLineCount: doc.lineCount,
				linesChanged: 0,
				language: doc.languageId,
			});
			_session.details.langs.set(doc.languageId, {
				language: doc.languageId,
				activeTime: 0,
				totalLines: 0,
			});
		});
	};
	return {
		get: () => _session,
	};
};
