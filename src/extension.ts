/** @format */

import * as vscode from 'vscode';
import { ContextStore } from './shared/ctx.s';

export async function activate(context: vscode.ExtensionContext) {
	const ctxStore = ContextStore(context); //* Just in case

	//? Debug Help Command
	const execDebug = vscode.commands.registerCommand(
		'devclock.execDebug',
		() => {
			vscode.window.showErrorMessage(
				`${vscode.workspace.textDocuments.map((doc) => doc.uri)}`,
				{ modal: true }
			);
		}
	);
	ctxStore.subscribe(execDebug);

	// if (ctxStore.get()) {
	// 	AppPreferences;
	// 	AppDetails;
	// 	// ? Load and Activate Preferences & Listeners
	// 	Object.entries(AppPreferences).forEach(
	// 		([_, onPreferenceHasChanged]) => {
	// 			console.log('Subscribing listener');
	// 			const disposable = onPreferenceHasChanged.disposable();
	// 			if (disposable) {
	// 				ctxStore.subscribe(disposable);
	// 			}
	// 		}
	// 	);

	// 	// ? Load Activity Listeners

	// 	// ?

	// 	// ? Load Statistic Listeners
}

export function deactivate() {}
