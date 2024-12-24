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
import { AppPreferences } from '../../shared/settings';

export const StateManagerConstructor = (
	logger: LogOutputChannel,
	dataRunner: ReturnType<typeof DataRunnerConstructor>
) => {
	let currentState: State = State.active;
	let session = SessionStore(logger);
	let timeTracker = TimebankStore(logger);
	let lastState: State = State.active;
	let tickCounter: number = 0;
	let forceSync: boolean = false;
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

	//? trigger reset on idle timer & store activity state
	const activityMonitor = (() => {
		let lastActivity = Date.now();
		const idleCheck = debounceState(() => {
			if (currentState !== State.idle) {
				transition(State.idle, Date.now());
				logger.info('Transitioning to idle state');
			}
		}, AppPreferences.idleThreshold.getTime());

		return {
			lastActivity: () => lastActivity,
			recordActivity: (now: number) => {
				lastActivity = now;
				if (currentState === State.idle) {
					transition(State.active, now);
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
			if (
				tickCounter > AppPreferences.syncTimeScale.getTimeScale() ||
				forceSync === true
			) {
				if (forceSync === true) {
					forceSync = false;
				}
				tickCounter = 0;
				session.syncFileSystem(now);
				dataRunner.saveSession(session.snapshot());
			}
			logger.info(
				`${
					(now - activityMonitor.lastActivity()) / 1000
				}s since last activity`
			);
		},
		initialize: (now: number) => {
			timeTracker.initialize(now);
		},
		state: () => currentState,
		forceSync: () => (forceSync = true),
		time: timeTracker,
		snapshot: () => session.snapshot(),
		handleEditorChange: ({
			data,
			now,
		}: {
			data: TextEditor | undefined;
			now: number;
		}) => {
			activityMonitor.recordActivity(now);
			if (!data) {
				session.syncFileSystem(now);
				return;
			}
			session.fileActivated(data.document, now);
		},
		handleFileRename: ({
			data,
			now,
		}: {
			data: FileRenameEvent;
			now: number;
		}) => {
			activityMonitor.recordActivity(now);
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
			activityMonitor.recordActivity(now);
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
			activityMonitor.recordActivity(now);
			data.files.forEach((file) => {
				session.fileDeleted(file, now);
			});
		},
		handleFileSystemSync: ({ data, now }: { data: any; now: number }) => {
			activityMonitor.recordActivity(now);
			session.syncFileSystem(now);
		},
		handleFileSave: ({
			data,
			now,
		}: {
			data: TextDocument;
			now: number;
		}) => {
			activityMonitor.recordActivity(now);
			session.fileSaved(data, now);
		},
		handleFileChange: ({
			data,
			now,
		}: {
			data: TextDocumentChangeEvent;
			now: number;
		}) => {
			activityMonitor.recordActivity(now);
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
