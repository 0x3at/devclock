import { ExtensionContext } from "vscode";
import { Listeners } from "./infrastructure/vsc/listeners/vsceventlisteners";
import { InitializeGui as Gui } from "./presentation/statusBar/init";

export const initializeExtension = (ctx: ExtensionContext) => {
	const disposableListeners = Listeners().map(
		(listener) => listener.disposable
	);
	disposableListeners.forEach((disposable) =>
		ctx.subscriptions.push(disposable)
	);

	const gui = Gui();
	const statusBar = gui.statusBar.disposable();
	ctx.subscriptions.push(statusBar);

	const loadPreferences = async () => {
		const preferences = await import("./shared/constants/settings.js");
		await preferences.AppStorage.globalStorage();
		return preferences;
	};

	loadPreferences()
		.then((preferences) => {
			console.log("App Details:", preferences.AppDetails);
			console.log("App Preferences:", preferences.AppPreferences);
			console.log("App Storage:", preferences.AppStorage);
		})
		.catch((error) => {
			console.error("Error loading preferences:", error);
		});
};
