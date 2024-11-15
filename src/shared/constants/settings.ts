import * as Globals from "./globalconstants";
import { ContextConstants } from "./contextconstents";
//*
//*Preferences Constants
//*-The Final Runtime configuration comprimised of stable constants
//* and user based constants
//*

// Helper functions
const getFromMemento = <T>(memento: any, key: string, defaultValue: T): T =>
	memento.get(key) ?? defaultValue;

const setInMemento = <T>(memento: any, key: string, value: T): void => {
	memento.update(key, value);
};

// Get global memento reference
const globalMemento = ContextConstants().getGlobalStateMap();
// Read from memento with fallback to globals
export const AppDetails = {
	appName: getFromMemento(globalMemento, "appName", Globals.APP_NAME),
	appRoot: getFromMemento(globalMemento, "appRoot", Globals.APP_ROOT),
	startTime: getFromMemento(globalMemento, "startTime", Globals.START_TIME),
	sessionID: getFromMemento(globalMemento, "sessionID", Globals.SESSION_ID),
	machineID: getFromMemento(globalMemento, "machineID", Globals.MACHINE_ID),
	appRuntime: getFromMemento(globalMemento, "appRuntime", Globals.APP_RUNTIME)
};

// Write any missing values back to memento
Object.entries(AppDetails).forEach(([key, value]) => {
	if (globalMemento.get(key) === undefined) {
		setInMemento(globalMemento, key, value);
	}
});

export const AppPreferences = {
	showTimer: getFromMemento(globalMemento, "showTimer", Globals.SHOW_TIMER),
	timerAlignment: getFromMemento(
		globalMemento,
		"timerAlignment",
		Globals.TIMER_ALIGNMENT
	),
	syncMode: getFromMemento(globalMemento, "syncMode", Globals.SYNC_MODE),
	throttleTime: getFromMemento(
		globalMemento,
		"throttleTime",
		Globals.THROTTLE_TIME
	),
	heartbeatThreshold: getFromMemento(
		globalMemento,
		"heartbeatThreshold",
		Globals.HEARTBEAT_THRESHOLD
	),
	debug: getFromMemento(globalMemento, "debug", Globals.DEBUG)
};

// Write any missing values back to memento
Object.entries(AppPreferences).forEach(([key, value]) => {
	if (globalMemento.get(key) === undefined) {
		setInMemento(globalMemento, key, value);
		console.log(`${key}: ${globalMemento.get(key)}`);
	}
});

export const AppStorage = {
	globalStorage: ContextConstants().getGlobalDirectory,
	appSecrets: ContextConstants().getAppSecrets()
};

Object.entries(AppStorage).forEach(([key, value]) => {
	if (globalMemento.get(key) === undefined) {
		setInMemento(globalMemento, key, value);
		console.log(`${key}: ${globalMemento.get(key)}`);
	}
});
