/** @format */
import {
	LogOutputChannel,
	TextDocument,
	TextEditor,
	Uri,
	window,
	workspace as ws,
} from 'vscode';
import {
	addToBlacklist,
	AppDetails,
	isBlacklisted,
} from '../../../shared/settings';
import {
	DevClockSession,
	DevclockSessionDetails,
	LanguageStatistic,
} from '../../../shared/types/session.s.t';

export const SessionStore = (logger: LogOutputChannel) => {
	let activeSession: DevClockSession = {
		appName: AppDetails.appName,
		sessionID: AppDetails.sessionID,
		startTime: AppDetails.startTime,
		duration: Date.now() - AppDetails.startTime,
		activeTime: Date.now() - AppDetails.startTime,
		debugTime: 0,
		idleTime: 0,
		details: {
			files: {},
			langs: {},
			metadata: {
				activeFiles: {},
				fileBlacklist: {},
			},
		},
	};

	//? Immutable Update Helper
	const updater = (session: DevClockSession) => {
		activeSession = session;
	};
	const createFileStat = (
		details: DevclockSessionDetails,
		document: TextDocument
	): DevclockSessionDetails => {
		if (
			details.files[document.fileName] ||
			isBlacklisted(document.fileName, logger)
		) {
			return details;
		}
		details.files[document.fileName] = {
			fileName: document.fileName.split('/').pop()!,
			filePath: document.fileName,
			isActive: false,
			activeFileTime: 0,
			startingLineCount: document.lineCount,
			linesChanged: 0,
			language: document.languageId,
		};
		let lang = details.langs[document.languageId];
		if (!lang) {
			details.langs[document.languageId] = createLanguageStat(
				document.languageId
			);
		}
		return details;
	};

	const createLanguageStat = (language: string): LanguageStatistic => {
		return {
			language: language,
			activeTime: 0,
			totalLines: 0,
		};
	};
	const handleFileChangeEvent = (
		details: DevclockSessionDetails,
		document: TextDocument,
		now: number
	): DevclockSessionDetails => {
		let file = details.files[document.fileName];
		if (!file) {
			details = createFileStat(details, document);
			return details;
		}
		file.linesChanged = Math.abs(
			document.lineCount - file.startingLineCount
		);
		details.files[document.fileName] = file;
		if (file.isActive) {
			details = handleFileDeactivationEvent(details, document, now);
			details = handleFileActivationEvent(details, document, now);
		} else {
			details = handleFileActivationEvent(details, document, now);
		}
		return details;
	};
	const handleFileSavedEvent = (
		details: DevclockSessionDetails,
		document: TextDocument,
		now: number
	): DevclockSessionDetails => {
		let file = details.files[document.fileName];
		if (!file) {
			details = createFileStat(details, document);
			return details;
		}
		file.linesChanged = Math.abs(
			document.lineCount - file.startingLineCount
		);
		details.files[document.fileName] = file;
		return details;
	};
	const handleFileActivationEvent = (
		details: DevclockSessionDetails,
		document: TextDocument,
		now: number
	): DevclockSessionDetails => {
		if (isBlacklisted(document.fileName, logger)) {
			return details;
		}
		// If file is active return
		if (details.metadata.activeFiles[document.fileName]) {
			return details;
		}
		let file = details.files[document.fileName];
		// If file is new, index it(create it)
		if (!file) {
			details = createFileStat(details, document);
			file = details.files[document.fileName];
			if (!file) {
				return details;
			}
		}
		// Now set file active
		file.isActive = true;
		details.files[document.fileName] = file;
		details.metadata.activeFiles[document.fileName] = {
			filePath: document.fileName,
			activeTime: now,
		};
		return details;
	};
	const handleFileDeactivationEvent = (
		details: DevclockSessionDetails,
		document: TextDocument,
		now: number
	): DevclockSessionDetails => {
		let file = details.files[document.fileName];
		if (!file) {
			return details;
		}
		let activeTimestamp = details.metadata.activeFiles[document.fileName];
		if (!activeTimestamp) {
			if (file.isActive === false) {
				return details;
			}
			file.isActive = false;
			details.files[document.fileName] = file;
			return details;
		}
		// Capture Changes
		let activeTime = now - activeTimestamp.activeTime;
		let changeOffset: number = Math.abs(
			document.lineCount - file.startingLineCount
		);
		file.activeFileTime += activeTime;
		file.linesChanged = changeOffset;

		// Update Language Stats
		let lang = details.langs[file.language];
		lang.activeTime += activeTime;
		lang.totalLines += changeOffset;

		// Update Details
		details.files[document.fileName] = file;
		details.langs[file.language] = lang;
		delete details.metadata.activeFiles[document.fileName];
		return details;
	};
	const handleFileRenamedEvent = (
		details: DevclockSessionDetails,
		newUri: Uri,
		oldUri: Uri
	): DevclockSessionDetails => {
		if (
			isBlacklisted(oldUri.fsPath, logger) ||
			isBlacklisted(newUri.fsPath, logger)
		) {
			return details;
		}
		let file = details.files[oldUri.fsPath];
		if (!file) {
			return details;
		}
		file.filePath = newUri.fsPath;
		file.fileName = newUri.fsPath.split('/').pop()!;
		details.files[newUri.fsPath] = file;
		delete details.files[oldUri.fsPath];

		let activeTimeStamp = details.metadata.activeFiles[oldUri.fsPath];
		if (!activeTimeStamp) {
			return details;
		}

		details.metadata.activeFiles[newUri.fsPath] = {
			filePath: newUri.fsPath,
			activeTime: activeTimeStamp.activeTime,
		};
		delete details.metadata.activeFiles[oldUri.fsPath];
		return details;
	};
	const handleFileCreationEvent = async (
		details: DevclockSessionDetails,
		uri: Uri
	): Promise<DevclockSessionDetails> => {
		if (isBlacklisted(uri.fsPath, logger)) {
			return details;
		}
		try {
			let doc = await ws.openTextDocument(uri);
			details = createFileStat(details, doc);
			return details;
		} catch (error) {
			addToBlacklist(uri.fsPath, logger);
			return details;
		}
	};
	const handleFileDeletionEvent = (
		details: DevclockSessionDetails,
		uri: Uri,
		now: number
	): DevclockSessionDetails => {
		let file = details.files[uri.fsPath];
		if (!file) {
			return details;
		}
		let delKey = `del_${file.fileName}`;
		if (details.metadata.activeFiles[uri.fsPath]) {
			file.activeFileTime =
				now - details.metadata.activeFiles[uri.fsPath]!.activeTime;
			file.isActive = false;
			delete details.metadata.activeFiles[uri.fsPath];
		}
		file.filePath = `DEL:${uri.fsPath}`;
		file.fileName = delKey;
		details.files[delKey] = file;
		delete details.files[uri.fsPath];
		return details;
	};
	const syncTime = (
		session: DevClockSession,
		times: {
			activeTime: number;
			debugTime: number;
			idleTime: number;
		},
		now: number
	): DevClockSession => {
		session.duration = now - session.startTime;
		session.activeTime = times.activeTime;
		session.debugTime = times.debugTime;
		session.idleTime = times.idleTime;
		return session;
	};
	const syncFileSystem = (
		details: DevclockSessionDetails,
		now: number
	): DevclockSessionDetails => {
		let visibleEditors = window.visibleTextEditors;
		let visibleFileNames: string[] = [];
		visibleEditors.forEach((editor: TextEditor) => {
			visibleFileNames.push(editor.document.fileName);
			if (
				details.metadata.activeFiles[editor.document.fileName] ||
				isBlacklisted(editor.document.fileName, logger)
			) {
				return;
			}
			details = handleFileActivationEvent(details, editor.document, now);
		});
		Object.entries(details.metadata.activeFiles).forEach(async (file) => {
			let doc;
			if (!visibleFileNames.includes(file[0])) {
				if (isBlacklisted(file[0], logger)) {
					return;
				}
				try {
					doc = await ws.openTextDocument(Uri.parse(file[0]));
					details = handleFileDeactivationEvent(details, doc, now);
				} catch (error) {
					// Log the error
					logger.warn(
						`Error occurred during file sync deactivate ${error}`
					);

					// Clean up file references
					const filePath = file[0];

					// Remove from active files
					delete details.metadata.activeFiles[filePath];

					// Remove from files if it exists
					if (details.files[filePath]) {
						const fileLanguage = details.files[filePath].language;

						// Clean up language stats if this was the only file of that language
						if (details.langs[fileLanguage]) {
							const hasOtherFilesOfSameLanguage = Object.values(
								details.files
							).some(
								(f) =>
									f.language === fileLanguage &&
									f.filePath !== filePath
							);

							if (!hasOtherFilesOfSameLanguage) {
								delete details.langs[fileLanguage];
							}
						}

						// Remove the file entry
						delete details.files[filePath];
					}

					// Add to blacklist to prevent future errors
					addToBlacklist(filePath, logger);
				}
			}
		});
		return details;
	};
	return {
		snapshot: () => ({ ...activeSession }),
		syncTime: (
			times: {
				activeTime: number;
				debugTime: number;
				idleTime: number;
			},
			now: number
		) => {
			updater({ ...syncTime(activeSession, times, now) });
		},
		syncFileSystem: (now: number) => {
			updater({
				...activeSession,
				details: syncFileSystem(activeSession.details, now),
			});
		},
		fileSaved: (document: TextDocument, now: number) => {
			updater({
				...activeSession,
				details: handleFileSavedEvent(
					activeSession.details,
					document,
					now
				),
			});
		},
		fileChanged: (document: TextDocument, now: number) => {
			updater({
				...activeSession,
				details: handleFileChangeEvent(
					activeSession.details,
					document,
					now
				),
			});
		},
		fileDeleted: (uri: Uri, now: number) => {
			updater({
				...activeSession,
				details: handleFileDeletionEvent(
					activeSession.details,
					uri,
					now
				),
			});
		},
		fileRenamed: (newUri: Uri, oldUri: Uri) => {
			updater({
				...activeSession,
				details: handleFileRenamedEvent(
					activeSession.details,
					newUri,
					oldUri
				),
			});
		},
		fileCreated: (uri: Uri) => {
			handleFileCreationEvent(activeSession.details, uri).then(
				(details) => {
					updater({
						...activeSession,
						details,
					});
				}
			);
		},
		fileActivated: (document: TextDocument, now: number) => {
			updater({
				...activeSession,
				details: handleFileActivationEvent(
					activeSession.details,
					document,
					now
				),
			});
		},
		fileDeactivated: (document: TextDocument, now: number) => {
			updater({
				...activeSession,
				details: handleFileDeactivationEvent(
					activeSession.details,
					document,
					now
				),
			});
		},
	};
};
