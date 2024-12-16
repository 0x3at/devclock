import { EventBrokerConstructor } from './broker.main';
import { StateManagerConstructor } from '../state/state.manager';
import { createVSCListener } from '../../utils/generators/vsc.listener.impl';
import { workspace, window, debug, Disposable } from 'vscode';
export const initializeBrokerSubscriptions = (
	manager: ReturnType<typeof StateManagerConstructor>,
	broker: ReturnType<typeof EventBrokerConstructor>
) => {
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
			broker.queueEvent
		).disposable
	);
	disposables.push(
		createVSCListener(
			workspace.onDidSaveTextDocument,
			'devclock.stat.fileSaved',
			broker.queueEvent
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
