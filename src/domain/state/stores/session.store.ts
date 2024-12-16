/** @format */
import {
	LogOutputChannel,
	TextDocument,
	TextEditor,
	Uri,
	window,
	workspace as ws,
} from 'vscode';
import { AppDetails } from '../../../shared/settings';
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
	const addToBlacklist = (
		details: DevclockSessionDetails,
		fileName: string
	) => {
		details.metadata.fileBlacklist[fileName] = details.metadata
			.fileBlacklist[fileName]
			? details.metadata.fileBlacklist[fileName] + 1
			: 1;
		logger.info(
			`Error occurred during file event\nBlacklisted ${fileName}`
		);
	};
	const isBlacklisted = (
		details: DevclockSessionDetails,
		fileName: string
	): boolean => {
		logger.info(`Checking if ${fileName} is blacklisted`);
		if (details.metadata.fileBlacklist[fileName] > 3) {
			logger.info(`${fileName} is blacklisted`);
			return true;
		}
		if (fileName.toLowerCase().includes('node_modules')) {
			logger.info(`${fileName} is blacklisted`);
			return true;
		}
		if (fileName.toLowerCase().includes('untitled')) {
			logger.info(`${fileName} is blacklisted`);
			return true;
		}
		if (fileName.toLowerCase().includes('://')) {
			logger.info(`${fileName} is blacklisted`);
			return true;
		}
		return false;
	};
	const updater = (session: DevClockSession) => {
		activeSession = session;
	};
	const createFileStat = (
		details: DevclockSessionDetails,
		document: TextDocument
	): DevclockSessionDetails => {
		if (
			details.files[document.fileName] ||
			isBlacklisted(details, document.fileName)
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
		if (isBlacklisted(details, document.fileName)) {
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
			isBlacklisted(details, oldUri.fsPath) ||
			isBlacklisted(details, newUri.fsPath)
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
		if (isBlacklisted(details, uri.fsPath)) {
			return details;
		}
		try {
			let doc = await ws.openTextDocument(uri);
			details = createFileStat(details, doc);
			return details;
		} catch (error) {
			addToBlacklist(details, uri.fsPath);
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
				isBlacklisted(details, editor.document.fileName)
			) {
				return;
			}
			details = handleFileActivationEvent(details, editor.document, now);
		});
		Object.entries(details.metadata.activeFiles).forEach(async (file) => {
			let doc;
			if (!visibleFileNames.includes(file[0])) {
				if (isBlacklisted(details, file[0])) {
					return;
				}
				try {
					doc = await ws.openTextDocument(Uri.parse(file[0]));
					details = handleFileDeactivationEvent(details, doc, now);
				} catch (error) {
					logger.warn(
						`Error occurred during file sync deactivate ${error}`
					);
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
