import { ExtensionContext } from "vscode";

export const initializeExtension = async (ctx: ExtensionContext) => {
	try {
		const impSettings = await import("./shared/constants/settings.js");
		const impListeners = await import(
			"./infrastructure/vsc/listeners/vsceventlisteners.js"
		);
		const impStatusBar = await import("./presentation/statusBar/init.js");
		const globalStoragePath = await impSettings.AppStorage.globalStorage;
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
		return {
			impSettings,
			globalStoragePath
		};
	} catch (error) {
		console.error("Error loading impSettings:", error);
		throw error;
	}
};
