import { workspace as ws } from "vscode";
import { TypeAppDetails, TypeAppPreferences, TypeAppStorage, PreferenceFactory, Preference } from '../types/settings';
import * as Globals from "./globalconstants";
import { localStoragePaths } from "./storagepaths";
//*
//*Preferences Constants
//*-The Final Runtime configuration comprimised of stable constants
//* and user based constants
//*


//? Get from global configuration
const CONFIG = ws.getConfiguration(Globals.EXTENSION_NAME);
const PreferenceFactory: PreferenceFactory = (name:string) => {
	let value:string|number|boolean|undefined = CONFIG.get(name);

	let listener = ws.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration(name)) {
			value = CONFIG.get(name);
			console.log(`Value of ${name.toString()} changed to ${value!.toString()}`);
		}
	});

	return {
		get: () => value,
		listener: () => listener
	};
};

export const AppDetails: TypeAppDetails = {
	appName: Globals.APP_NAME,
	appRoot: Globals.APP_ROOT,
	startTime:  Globals.START_TIME,
	sessionID:  Globals.SESSION_ID,
	machineID:  Globals.MACHINE_ID,
	isDesktop:  Globals.APP_RUNTIME === "desktop"
};


export const AppPreferences: TypeAppPreferences = {
	showTimer: PreferenceFactory("interface.showTimer"),
	timerAlignment: PreferenceFactory("interface.timerAlignment"),
	debug: PreferenceFactory("config.debug"),
	syncMode: PreferenceFactory("config.syncMode"),
	throttleTime: PreferenceFactory("config.throttleTime"),
	heartbeatThreshold: PreferenceFactory("config.heartbeatThreshold")
};


export const AppStorage: TypeAppStorage = {
	globalStorage: localStoragePaths().getGlobalDirectory(),
	appSecrets: localStoragePaths().getAppSecrets()
};



