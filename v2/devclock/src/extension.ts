import * as vscode from "vscode";
import { ExtReady } from "./utils/storage/ext.setup";
import { Context } from "./shared/ctx/ctx";
export async function activate(ctx: vscode.ExtensionContext) {
	Context.set(ctx);
	if (ExtReady(ctx)) {
		//TODO Add more sanity checks to ExtReady
		const settings = await import("./shared/const/settings.js");
		Object.entries(settings.AppPreferences).map(([_, impl]) =>
			Context.addDisposable(impl.disposable())
		);

		//! Setup Storage - connect to DB

		//! Setup StateManagers

		//! Setup DataStore

		//! Setup Listeners
		const eventListeners = await import(
			"./infrastructure/vsc/listeners/user.events.js"
		);
		eventListeners
			.Listeners()
			.map((listener) => Context.addDisposable(listener.disposable));

		//! Setup UI
	} else {
		//? Handle Non Local Connection
	}
}

// const disposable = vscode.commands.registerCommand('devclock.helloWorld', () => {
// 	vscode.window.showInformationMessage('Hello World from devclock!');
// });
// context.subscriptions.push(disposable);

export function deactivate() {}
