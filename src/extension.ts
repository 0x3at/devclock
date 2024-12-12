/** @format */

import * as vscode from 'vscode';
import { AppDetails, AppPreferences } from './shared/settings';
import { ContextStore } from './shared/ctx.s';
import { workspaceListeners } from './infra/listeners/workspace.listeners';
import { Preference } from './utils/generators/preference.g';

export async function activate(context: vscode.ExtensionContext) {
	const ctxStore = ContextStore(context); //* Just in case

	//? Debug Help Command
	const execDebug = vscode.commands.registerCommand(
		'devclock.execDebug',
		() => {
			vscode.window.showErrorMessage('debug', { modal: true });
		}
	);
	ctxStore.subscribe(execDebug);

	if (ctxStore.get()) {
		AppPreferences;
		AppDetails;
		Object.entries(AppPreferences).forEach(
			([_, onPreferenceHasChanged]) => {
				console.log('Subscribing listener');
				const disposable = onPreferenceHasChanged.disposable();
				if (disposable) {
					ctxStore.subscribe(disposable);
				}
			}
		);
		console.log('Settings Loaded');

		const documentListeners = workspaceListeners();
		documentListeners.forEach((listener) => {
			console.log('Subscribing listener');
			const disposable = listener.disposable;
			context.subscriptions.push(disposable!);
		});
		console.log('Editor Listeners Loaded');

		//?Load Third Party API Listeners(Git)

		//?Load UI
	}
}

export function deactivate() {}
