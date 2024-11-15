import {
	commands,
	ExtensionContext,
	QuickPickItem,
	QuickPickOptions,
	OpenDialogOptions,
	window,
	workspace as ws,
	env,
	Disposable,
	Uri
} from "vscode";

import { createDatabase, updateDatabase } from "../../workers/createdbprocess";

const errorMessage = {
	detail: "Something went wrong",
	modal: true
};

const defaultSetMessage = {
	detail: "Something went wrong, but we fixed it!",
	modal: false
};

// export type SetupAppCommands = (cts: ExtensionContext) => Promise<{
// 	getDisposables: () => Disposable[];
// }>;

export const asyncAppCommands = (ctx: ExtensionContext) => {
	let setSync: Disposable = commands.registerCommand(
		"devclock.syncMode",
		() => setSyncMode(ctx)
	);
	let setStorage: Disposable = commands.registerCommand(
		"devclock.globalStorage",
		() => setGlobalStorage(ctx)
	);
	let setupDatabase: Disposable = commands.registerCommand(
		"devclock.setupDatabase",
		() => initializeDatabase(ctx)
	);
	let updateDatabase: Disposable = commands.registerCommand(
		"devclock.updateDatabase",
		() => pushToDatabase(ctx)
	);
	return {
		getDisposables: (): Disposable[] => [setSync, setStorage, setupDatabase, updateDatabase]
	};
};

const setSyncMode = async (ctx: ExtensionContext, retryCtr = 0) => {
	if (retryCtr > 3) {
		await window.showErrorMessage(
			"Failed to set sync mode more than 3 times, falling to default | HYBRID",
			errorMessage
		);
		await ws.getConfiguration("devclock").update("syncMode", "HYBRID");
		return;
	}

	let selection: string | undefined = undefined;
	if (!selection) {
		let hybrid: QuickPickItem = {
			label: "Hybrid",
			alwaysShow: true,
			description: "Sync data between local and cloud",
			picked: true
		};
		let local: QuickPickItem = {
			label: "Local",
			alwaysShow: true,
			description: "Sync data only with local"
		};
		let cloud: QuickPickItem = {
			label: "Cloud",
			alwaysShow: true,
			description: "Sync data only with cloud"
		};
		const items: QuickPickItem[] = [hybrid, local, cloud];
		const options: QuickPickOptions = {
			title: "DevClock Sync Mode",
			canPickMany: false,
			ignoreFocusOut: true,
			placeHolder: "Select how you would like to sync data"
		};
		const selection: QuickPickItem | undefined = await window.showQuickPick(
			items,
			options
		);
		if (selection) {
			console.log(`Selected item: ${selection.toString()}`);
			switch (selection.label) {
				case "Hybrid":
					console.log(`Setting sync mode to HYBRID`);
					ws.getConfiguration("devclock.config").update(
						"syncMode",
						"HYBRID",
						true
					);
					break;
				case "Local":
					console.log(`Setting sync mode to LOCAL`);
					ws.getConfiguration("devclock.config").update(
						"syncMode",
						"LOCAL",
						true
					);
					break;
				case "Cloud":
					console.log(`Setting sync mode to CLOUD`);
					ws.getConfiguration("devclock.config").update(
						"syncMode",
						"CLOUD",
						true
					);
					break;
				default:
					break;
			}
		} else {
			if (ws.getConfiguration("devclock").get("syncMode")) {
				await window.showInformationMessage(
					`No selection made, using current sync mode ${ws
						.getConfiguration("devclock")
						.get("syncMode")}`,
					defaultSetMessage
				);
				return;
			} else {
				console.log(
					`Failed to set sync mode, retrying... ${retryCtr}/3`
				);
				setSyncMode(ctx, retryCtr + 1);
				return;
			}
		}
		console.log(`Selected item: ${selection}`);
	}
};

const setGlobalStorage = async (ctx: ExtensionContext, retryCtr = 0) => {
	if (retryCtr > 3) {
		await window.showErrorMessage(
			"Failed to set global storage more than 3 times, falling to cloud sync",
			errorMessage
		);
		await ws.getConfiguration("devclock").update("syncMode", "CLOUD");
		return;
	}

	const globalStoragePath = ctx.globalStorageUri;

	let dialogOptions: OpenDialogOptions = {
		title: "Select Path for Storing DevClock Data",
		canSelectFolders: true,
		canSelectFiles: false,
		canSelectMany: false,
		defaultUri: globalStoragePath
			? globalStoragePath
			: env.appRoot.length < 1
			? undefined
			: Uri.parse(env.appRoot),
		openLabel: "Store Data Here"
	};
	const filePicker = await window.showOpenDialog(dialogOptions);
	if (!filePicker) {
		if (!globalStoragePath) {
			console.log(
				`Failed to set global storage, retrying... ${retryCtr}/3`
			);
			setGlobalStorage(ctx, retryCtr + 1);
			return;
		} else {
			await window.showInformationMessage(
				`No path selected, using default path ${globalStoragePath.path}`,
				defaultSetMessage
			);
		}
	}
};

const initializeDatabase = async (ctx: ExtensionContext) => {
    const dbPath = await createDatabase();
    ctx.globalState.update('dbPath', dbPath);
	console.log(ctx.globalState.get('dbPath'));
	await window.showInformationMessage(`Database initialized at ${dbPath}`, defaultSetMessage);
};

const pushToDatabase = async (ctx: ExtensionContext) => {
	const dbPath = ctx.globalState.get('dbPath');
	if (!dbPath) {
		await window.showErrorMessage('Database path not found', errorMessage);
		return;
	}
	try {
		await updateDatabase();
		await window.showInformationMessage('DevClock Database Updated!', defaultSetMessage);
	} catch (error) {
		await window.showErrorMessage('Failed to push to database', errorMessage);
	}
};

