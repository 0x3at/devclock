/** @format */
import { TextDocument, TextEditor, Uri, window, workspace as ws } from 'vscode';
import { AppDetails } from '../../shared/settings';
import { Session } from '../../shared/types/session.s.t';
import { FileStats, LanguageStat } from '../../shared/types/details.s.t';

const Session = () => {
	let activeFiles: Map<string, number> = new Map<string, number>();

	let session: Session = {
		appName: AppDetails.appName,
		sessionID: AppDetails.sessionID,
		startTime: AppDetails.startTime,
		duration: Date.now() - AppDetails.startTime,
		activeTime: Date.now() - AppDetails.startTime,
		debugTime: 0,
		idleTime: 0,
		details: {
			files: new Map<string, FileStats>(),
			langs: new Map<string, LanguageStat>(),
		},
	};
	const newFile = (document: TextDocument, active: boolean = false) => {
		session.details.files.set(document.fileName, {
			fileName: document.fileName.split('/').pop()!,
			filePath: document.fileName,
			isActive: active,
			activeFileTime: 0,
			startingLineCount: document.lineCount,
			linesChanged: 0,
			language: document.languageId,
		});
		let lang = session.details.langs.get(document.languageId);
		if (!lang) {
			session.details.langs.set(document.languageId, {
				language: document.languageId,
				activeTime: 0,
				totalLines: 0,
			});
		}
	};
	const fileActivated = (document: TextDocument) => {
		let now = Date.now();
		let file = session.details.files.get(document.fileName);
		if (file) {
			file.isActive = true;
			if (activeFiles.get(file.fileName)) {
				file.activeFileTime += now - activeFiles.get(file.fileName)!;
				file.linesChanged = Math.abs(
					file.startingLineCount - document.lineCount
				);
				let lang = session.details.langs.get(file.language)!;
				lang.activeTime = now - activeFiles.get(file.fileName)!;
				lang.totalLines += file.linesChanged;
				session.details.langs.set(file.language, lang);
			}
			session.details.files.set(document.fileName, file);
		} else {
			newFile(document, true);
		}
		activeFiles.set(document.fileName, Date.now());
	};
	const fileDeactivated = (document: TextDocument) => {
		let now = Date.now();
		let file = session.details.files.get(document.fileName);
		let activeTimestamp = activeFiles.get(document.fileName);
		if (file && activeTimestamp) {
			let changeOffset: number = Math.abs(
				document.lineCount - file.startingLineCount
			);
			let lang = session.details.langs.get(file.language);
			file.activeFileTime += now - activeFiles.get(document.fileName)!;
			file.linesChanged = changeOffset;
			if (lang) {
				lang.activeTime += now - activeFiles.get(document.fileName)!;
				lang.totalLines += file.linesChanged;
			} else {
				lang = {
					language: file.language,
					activeTime: now - activeFiles.get(document.fileName)!,
					totalLines: changeOffset,
				};
			}
			file.isActive = false;
			session.details.files.set(document.fileName, file);
			session.details.langs.set(file.language, lang);
			activeFiles.delete(document.fileName);
		}
	};
	const fileRenamed = (newUri: Uri, oldUri: Uri) => {
		let file = session.details.files.get(oldUri.fsPath);
		if (file) {
			session.details.files.set(newUri.fsPath, file);
			session.details.files.delete(oldUri.fsPath);
			let activeState = activeFiles.get(oldUri.fsPath);
			if (activeState) {
				activeFiles.set(newUri.fsPath, activeState);
				activeFiles.delete(oldUri.fsPath);
			}
		}
	};
	const fileCreated = (uris: Uri[]) => {
		uris.forEach((uri) => {
			ws.openTextDocument(uri).then((doc) => {
				newFile(doc, false);
			});
		});
	};
	const fileDeleted = (uris: Uri[]) => {
		uris.forEach((uri) => {
			let file = session.details.files.get(uri.fsPath);
			if (file) {
				let delKey = `del_${file.fileName}`;
				session.details.files.set(delKey, file);
				if (activeFiles.has(uri.fsPath)) {
					activeFiles.delete(uri.fsPath);
					file.activeFileTime =
						Date.now() - activeFiles.get(uri.fsPath)!;
					file.isActive = false;
					activeFiles.delete(uri.fsPath);
				}
				session.details.files.delete(uri.fsPath);
			}
		});
	};
	const sync = (
		times: {
			activeTime: number;
			debugTime: number;
			idleTime: number;
		},
		visibleEditors: TextEditor[]
	) => {
		session.activeTime = times.activeTime;
		session.debugTime = times.debugTime;
		session.idleTime = times.idleTime;
		let visibleFileNames: string[] = [];
		//* Update Active File Stats
		visibleEditors.forEach((editor: TextEditor) => {
			visibleFileNames.push(editor.document.fileName);
			fileActivated(editor.document);
		});
		//* Deactivate any inactive files
		Array.from(activeFiles.keys()).forEach((fileName) => {
			if (!visibleFileNames.includes(fileName)) {
				let target = visibleEditors.filter(
					(editor) => editor.document.fileName === fileName
				);
				fileDeactivated(target[0].document);
			}
		});
	};
	const initialize = () => {
		ws.textDocuments.map((doc: TextDocument) => {
			newFile(doc, false);
			window.visibleTextEditors.forEach((editor: TextEditor) => {
				newFile(editor.document, true);
				fileActivated(editor.document);
			});
		});
	};
	return {
		initialize,
		get: () => session,
		sync,
		fileActivated,
		fileDeactivated,
		fileRenamed,
		fileCreated,
		fileDeleted,
	};
};
