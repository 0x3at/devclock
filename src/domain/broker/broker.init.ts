/** @format */

import { debug, Disposable, LogOutputChannel, window, workspace } from 'vscode';
import { createVSCListener } from '../../utils/generators/vsc.listener.impl';
import { throttle } from '../../utils/throttle';
import { StateManagerConstructor } from '../state/state.manager';
import { EventBrokerConstructor } from './broker.main';

//? Event Registry for easy event mapping
export const initializeBrokerSubscriptions = (
	manager: ReturnType<typeof StateManagerConstructor>,
	broker: ReturnType<typeof EventBrokerConstructor>,
	logger: LogOutputChannel
) => {
	logger.debug('Initializing broker subscriptions');
	let disposables: Disposable[] = [];
	broker.subscribe('devclock.debug.started', manager!.handleDebugStart);
	broker.subscribe('devclock.debug.ended', manager!.handleDebugEnd);
	broker.subscribe(
		'devclock.stat.activeEditorChanged',
		manager!.handleEditorChange
	);
	broker.subscribe('devclock.stat.fileRenamed', manager!.handleFileRename);
	broker.subscribe('devclock.stat.fileCreated', manager!.handleFileCreate);
	broker.subscribe('devclock.stat.fileDeleted', manager!.handleFileDelete);
	broker.subscribe('devclock.stat.fileSaved', manager!.handleFileSave);
	broker.subscribe('devclock.stat.fileChanged', manager!.handleFileChange);
	disposables.push(
		createVSCListener(
			workspace.onDidRenameFiles,
			'devclock.stat.fileRenamed',
			broker.queueEvent
		).disposable
	);
	disposables.push(
		createVSCListener(
			workspace.onDidCreateFiles,
			'devclock.stat.fileCreated',
			broker.queueEvent
		).disposable
	);
	disposables.push(
		createVSCListener(
			workspace.onDidDeleteFiles,
			'devclock.stat.fileDeleted',
			broker.queueEvent
		).disposable
	);
	disposables.push(
		createVSCListener(
			window.onDidChangeActiveTextEditor,
			'devclock.stat.activeEditorChanged',
			broker.queueEvent
		).disposable
	);
	disposables.push(
		createVSCListener(
			workspace.onDidChangeTextDocument,
			'devclock.stat.fileChanged',
			broker.queueEvent,
			{
				fn: throttle,
				duration: 10 * 1000,
			}
		).disposable
	);
	disposables.push(
		createVSCListener(
			workspace.onDidSaveTextDocument,
			'devclock.stat.fileSaved',
			(data, label) => {
				logger.debug(`VSC listener triggered for ${label}`);
				broker.queueEvent(data, label);
			}
		).disposable
	);
	disposables.push(
		createVSCListener(
			debug.onDidStartDebugSession,
			'devclock.debug.started',
			broker.queueEvent
		).disposable
	);
	disposables.push(
		createVSCListener(
			debug.onDidTerminateDebugSession,
			'devclock.debug.ended',
			broker.queueEvent
		).disposable
	);
	return disposables;
};
