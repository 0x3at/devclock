import { StatusBarAlignment } from "vscode";
import { InitializeDataStore } from "../../domain/store/actions";
import {
	appHost,
	appName,
	appRoot,
	machineID,
	sessionID
} from "../../infrastructure/vsc/utils/data";
import { SyncMode } from "../types/syncmodes";
//* Global Constants
export const DATASTORE = InitializeDataStore();

//* Values
export const MILLISECONDS_IN_SECOND: number = 1000;
export const SECONDS_IN_MINUTE: number = 60;
export const MINUTES_IN_HOUR: number = 60;
export const EXTENSION_NAME: string = "devclock";

//* App Configuration
export const DEBUG: boolean = false;
export const APP_RUNTIME: string = Object.freeze(appHost());
export const SESSION_ID: string = Object.freeze(sessionID());
export const APP_NAME: string = Object.freeze(appName());
export const APP_ROOT: string = Object.freeze(appRoot());
export const MACHINE_ID: string = Object.freeze(machineID());
export const START_TIME: number = Object.freeze(Date.now());

//* Extension Configuration
export const SHOW_SECONDS: boolean = false;
export const SHOW_TIMER: boolean = true;
export const TIME_INTERVAL: number = SHOW_SECONDS ? 1000 : 10000;
export const TIMER_ALIGNMENT: StatusBarAlignment = StatusBarAlignment.Left;
export const THROTTLE_TIME: number = 30000;
export const SYNC_MODE: SyncMode = SyncMode.HYBRID;
export const HEARTBEAT_THRESHOLD: number = 100;

// //* Debug Logging of Global Constants
// console.log("Global Constants Debug Log:", {
// 	MILLISECONDS_IN_SECOND,
// 	SECONDS_IN_MINUTE,
// 	MINUTES_IN_HOUR,
// 	DEBUG,
// 	START_TIME,
// 	APP_RUNTIME,
// 	SESSION_ID,
// 	APP_NAME,
// 	APP_ROOT,
// 	MACHINE_ID,
// 	CONTEXT,
// 	THROTTLE_TIME,
// 	SYNC_MODE,
// 	HEARTBEAT_THRESHOLD,
// 	SHOW_TIMER,
// 	TIMER_ALIGNMENT
// });
