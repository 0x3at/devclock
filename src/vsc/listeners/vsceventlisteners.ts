import {
	workspace as ws,
	TextDocumentChangeEvent,
	TextDocument,
	ConfigurationChangeEvent,
	DebugSession,
	debug
} from "vscode";

export const TextChangeListener = (
	callback: (e: TextDocumentChangeEvent) => void) => {
	let disposable = ws.onDidChangeTextDocument(
		(e: TextDocumentChangeEvent) => {
			callback(e);
		}
	);
	return {
		pause: () => disposable.dispose(),
		resume: () =>
			(disposable = ws.onDidChangeTextDocument(
				(e: TextDocumentChangeEvent) => {
					callback(e);
				}
			))
	};
};
export const docOpenedListener = (callback: (e: TextDocument) => void) => {
	let disposable = ws.onDidOpenTextDocument((e: TextDocument) => {
		callback(e);
	});
	return {
		pause: () => disposable.dispose(),
		resume: () =>
			(disposable = ws.onDidOpenTextDocument((e: TextDocument) => {
				callback(e);
			}))
	};
};

export const docClosedListener = (callback: (e: TextDocument) => void) => {
	let disposable = ws.onDidCloseTextDocument((e: TextDocument) => {
		callback(e);
	});
	return {
		pause: () => disposable.dispose(),
		resume: () =>
			(disposable = ws.onDidCloseTextDocument((e: TextDocument) => {
				callback(e);
			}))
	};
};

export const docSavedListener = (callback: (e: TextDocument) => void) => {
	let disposable = ws.onDidSaveTextDocument((e: TextDocument) => {
		callback(e);
	});
	return {
		pause: () => disposable.dispose(),
		resume: () =>
			(disposable = ws.onDidSaveTextDocument((e: TextDocument) => {
				callback(e);
			}))
	};
};

export const configChangedListener = (
	callback: (e: ConfigurationChangeEvent) => void
) => {
	let disposable = ws.onDidChangeConfiguration(
		(e: ConfigurationChangeEvent) => {
			callback(e);
		}
	);
	return {
		pause: () => disposable.dispose(),
		resume: () =>
			(disposable = ws.onDidChangeConfiguration(
				(e: ConfigurationChangeEvent) => {
					callback(e);
				}
			))
	};
};

export const debugSessionStartedListener = (
	callback: (e: DebugSession) => void
) => {
	let disposable = debug.onDidStartDebugSession((e: DebugSession) => {
		callback(e);
	});
	return {
		pause: () => disposable.dispose(),
		resume: () =>
			(disposable = debug.onDidStartDebugSession((e: DebugSession) => {
				callback(e);
			}))
	};
};

export const debugSessionEndedListener = (
	callback: (e: DebugSession) => void
) => {
	let disposable = debug.onDidTerminateDebugSession((e: DebugSession) => {
		callback(e);
	});
	return {
		pause: () => disposable.dispose(),
		resume: () => (disposable = debug.onDidTerminateDebugSession((e: DebugSession) => {
			callback(e);
		}))
	};
};


