/** @format */
import { debug, workspace as ws } from 'vscode';
import { VSCListener } from '../../shared/types/listener.s.t';
import { createGenericListener } from './implementation/vsc.listener.impl';
import { EventBuffer } from '../buffers/event.buffer';
import { EventQueue } from '../eventqueue.q';

export const workspaceListeners = (): VSCListener[] => {
	console.log('[WorkspaceListeners] Initializing workspace listeners');

	const listenerList: VSCListener[] = [];

	listenerList.push(
		createGenericListener(ws.onDidChangeTextDocument, EventBuffer, 100)
	);

	listenerList.push(
		createGenericListener(ws.onDidOpenTextDocument, EventBuffer)
	);
	listenerList.push(
		createGenericListener(ws.onDidCloseTextDocument, EventQueue)
	);
	listenerList.push(
		createGenericListener(ws.onDidSaveTextDocument, EventQueue)
	);

	listenerList.push(
		createGenericListener(debug.onDidStartDebugSession, EventQueue)
	);
	listenerList.push(
		createGenericListener(debug.onDidTerminateDebugSession, EventQueue)
	);

	console.log(
		`[WorkspaceListeners] Created ${listenerList.length} listeners`
	);
	return listenerList;
};
