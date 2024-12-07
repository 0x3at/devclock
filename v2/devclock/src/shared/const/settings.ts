import {
    env,
    ExtensionContext,
    workspace as ws
} from "vscode";

const EXTENSION_NAME = "devclock";
const APP_OS: string = env.appHost;
const SESSION_ID: string = env.sessionId;
const APP_NAME: string = env.appName;
const APP_ROOT: string = env.appRoot;
const MACHINE_ID: string = env.machineId;
const START_TIME: number = Date.now();

const CONFIG = ws.getConfiguration(EXTENSION_NAME);
const Preference = (name:string) => {
	let value:string = CONFIG.get(name)!;

	let _disposable = ws.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration(name)) {
			value = CONFIG.get(name)!;
			console.log(`Value of ${name.toString()} changed to ${value!.toString()}`);
		}
	});

	return {
		get: () => value,
		disposable: () => _disposable
	};
};

export const AppDetails = {
    name: APP_NAME,
    sessionId: SESSION_ID,
    os: APP_OS,
    root: APP_ROOT,
    machineId: MACHINE_ID,
    startTime: START_TIME
};

export const AppPreferences = {
	showTimer: Preference("interface.showTimer"),
	timerAlignment: Preference("interface.timerAlignment"),
	debug: Preference("config.debug"),
	syncMode: Preference("config.syncMode"),
	throttleTime: Preference("config.throttleTime"),
	heartbeatThreshold: Preference("config.heartbeatThreshold")
};

export const ExtensionFlags = (ctx:ExtensionContext) => {
    return{
    welcome:ctx.globalState.get("welcome")?? false,
    dbExists:ctx.globalState.get("dbExists")?? false,
    };
};