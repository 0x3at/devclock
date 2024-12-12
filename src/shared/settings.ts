/** @format */

import { env } from 'vscode';

import { Preference } from '../utils/generators/preference.g';

const EXTENSION_NAME: string = 'devclock';
const APP_OS: string = env.appHost;
const SESSION_ID: string = env.sessionId;
const APP_NAME: string = env.appName;
const APP_ROOT: string = env.appRoot;
const MACHINE_ID: string = env.machineId;
const START_TIME: number = Date.now();

export const AppDetails = {
	appName: APP_NAME,
	sessionID: SESSION_ID,
	os: APP_OS,
	root: APP_ROOT,
	machineId: MACHINE_ID,
	startTime: START_TIME,
};

export const AppPreferences = {
	showTimer: Preference('interface.showTimer', EXTENSION_NAME),
	timerAlignment: Preference('interface.timerAlignment', EXTENSION_NAME),
	debug: Preference('config.debug', EXTENSION_NAME),
	syncMode: Preference('config.syncMode', EXTENSION_NAME),
	throttleTime: Preference('config.throttleTime', EXTENSION_NAME),
	heartbeatThreshold: Preference('config.heartbeatThreshold', EXTENSION_NAME),
	idleThreshold: Preference('config.idleThreshold', EXTENSION_NAME), //TODO: ADDD TO CONFIG
	timeScale: Preference('config.timeScale', EXTENSION_NAME), //TODO: ADDD TO CONFIG
};
