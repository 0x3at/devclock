import { InitializeDataStore } from "../../domain/store/actions";
import {
	appHost,
	appName,
	appRoot,
	machineID,
	sessionID
} from "../../infrastructure/vsc/utils/data";
//* Global Constants
export const DATASTORE = InitializeDataStore();

//* Values
export const MILLISECONDS_IN_SECOND: number = 1000;
export const SECONDS_IN_MINUTE: number = 60;
export const MINUTES_IN_HOUR: number = 60;
export const EXTENSION_NAME: string = "devclock";

//* App Configuration
export const APP_RUNTIME: string = Object.freeze(appHost());
export const SESSION_ID: string = Object.freeze(sessionID());
export const APP_NAME: string = Object.freeze(appName());
export const APP_ROOT: string = Object.freeze(appRoot());
export const MACHINE_ID: string = Object.freeze(machineID());
export const START_TIME: number = Object.freeze(Date.now());
