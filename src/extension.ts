import * as vscode from 'vscode';
import {initializeExtension} from './initialize';
import {CONTEXT,DATASTORE} from './core/globalconstants';


export function activate(ctx: vscode.ExtensionContext) {
	//* Set Context
	CONTEXT.setContext(ctx);

	//* Capture Context Reliant Constants
	if (CONTEXT.getContext() !== null) {
		import('./vsc/contextconstents.js').then((module) => {
			initializeExtension();
		}).catch((err) => console.log(err));
	}

	const disposable = vscode.commands.registerCommand('devclock.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from DevClock!');
	});

	ctx.subscriptions.push(disposable);
}

export function deactivate() {}
