/** @format */

import {
	DebugSession,
	FileCreateEvent,
	FileDeleteEvent,
	FileRenameEvent,
	LogOutputChannel,
	TextDocument,
	TextDocumentChangeEvent,
	TextEditor,
} from 'vscode';
import { State } from '../../shared/enums/state.s.e';
import { debounceState } from '../../utils/debounce';
import { SessionStore } from './stores/session.store';
import { TimebankStore } from './stores/timebank.store';
import { DataRunnerConstructor } from '../../data.runner';

export const StateManagerConstructor = (
	logger: LogOutputChannel,
	dataRunner: ReturnType<typeof DataRunnerConstructor>
) => {
	let currentState: State = State.active;
	let session = SessionStore(logger);
	let timeTracker = TimebankStore(logger);
	let lastState: State = State.active;
	let tickCounter: number = 0;
	const transition = (state: State, now: number) => {
		logger.info(`Transitioning from ${lastState} to ${state}`);
		if (state === currentState) {
			return;
		}

		lastState = currentState;
		currentState = state;
		if (lastState !== State.active) {
			timeTracker.stop(lastState, now);
		}
		timeTracker.start(state, now);
	};

	const activityMonitor = (() => {
		const idleCheck = debounceState(() => {
			transition(State.idle, Date.now());
			logger.info('Idle check triggered');
		}, 60 * 1000);

		return {
			recordActivity: () => {
				if ((currentState as State) === State.idle) {
					transition(State.active, Date.now());
				}
				logger.info('Activity recorded, resetting idle check');
				idleCheck();
			},
		};
	})();

	return {
		tick: (now: number) => {
			tickCounter++;
			timeTracker.tick(now);
			session.syncTime(timeTracker.getBank(), now);
			if (tickCounter > 300) {
				tickCounter = 0;
				session.syncFileSystem(now);
				dataRunner.saveSession(session.snapshot());
			}
		},
		initialize: (now: number) => {
			timeTracker.initialize(now);
		},
		state: () => currentState,
		time: timeTracker,
		snapshot: () => session.snapshot(),
		handleEditorChange: ({
			data,
			now,
		}: {
			data: TextEditor[];
			now: number;
		}) => {
			activityMonitor.recordActivity();
			if (!data) {
				session.syncFileSystem(now);
				return;
			}
			data.forEach((editor) => {
				session.fileActivated(editor.document, now);
			});
		},
		handleFileRename: ({
			data,
			now,
		}: {
			data: FileRenameEvent;
			now: number;
		}) => {
			activityMonitor.recordActivity();
			data.files.forEach((file) => {
				session.fileRenamed(file.newUri, file.oldUri);
			});
		},
		handleFileCreate: ({
			data,
			now,
		}: {
			data: FileCreateEvent;
			now: number;
		}) => {
			activityMonitor.recordActivity();
			data.files.forEach((file) => {
				session.fileCreated(file);
			});
		},
		handleFileDelete: ({
			data,
			now,
		}: {
			data: FileDeleteEvent;
			now: number;
		}) => {
			activityMonitor.recordActivity();
			data.files.forEach((file) => {
				session.fileDeleted(file, now);
			});
		},
		handleFileSystemSync: ({ data, now }: { data: any; now: number }) => {
			activityMonitor.recordActivity();
			session.syncFileSystem(now);
		},
		handleFileSave: ({
			data,
			now,
		}: {
			data: TextDocument;
			now: number;
		}) => {
			activityMonitor.recordActivity();
			session.fileSaved(data, now);
		},
		handleFileChange: ({
			data,
			now,
		}: {
			data: TextDocumentChangeEvent;
			now: number;
		}) => {
			activityMonitor.recordActivity();
			session.fileChanged(data.document, now);
		},
		handleDebugStart: ({
			data,
			now,
		}: {
			data: DebugSession;
			now: number;
		}) => {
			transition(State.debug, now);
		},
		handleDebugEnd: ({
			data,
			now,
		}: {
			data: DebugSession;
			now: number;
		}) => {
			transition(State.active, now);
		},
	};
};
