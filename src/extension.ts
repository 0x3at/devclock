import * as vscode from "vscode";
import { CONTEXT } from "./infrastructure/vsc/context";
import { devclockCommands as devclockCommands } from "./presentation/commands/initialize";

export async function activate(ctx: vscode.ExtensionContext) {

	CONTEXT.setContext(ctx); //* Set the context to easily share

	const startup = devclockCommands(ctx);
	const commandDisposables = startup.getDisposables(); //TODO: Find a way to dynamically get the disposables
	vscode.commands.executeCommand('devclock.setupDatabase');

	commandDisposables.map((d) => ctx.subscriptions.push(d));


	if (CONTEXT.getContext() !== null) {
		try {
			const impSettings = await import("./shared/constants/settings.js");
			const impListeners = await import(
				"./infrastructure/vsc/listeners/vsceventlisteners.js"
			);
			const impStatusBar = await import("./presentation/statusBar/init.js");
			const globalStoragePath = await impSettings.AppStorage.globalStorage; //* import to instantiate
			const heartbeatListeners = impListeners
				.Listeners()
				.map((listener) => listener.disposable);
			const configListeners = Object.values(impSettings.AppPreferences).map(
				(preference) => preference.listener()
			);
			heartbeatListeners.forEach((disposable) =>
				ctx.subscriptions.push(disposable)
			);
			configListeners.forEach((listener) => ctx.subscriptions.push(listener));
			if (impSettings.AppPreferences.showTimer.get()) {
				const statusBar = impStatusBar.InitializeGuiTimer();
				ctx.subscriptions.push(statusBar.statusBar.disposable());
		}
	} catch (error) {
		console.error(error);
	}
	}
}
export function deactivate() {}

