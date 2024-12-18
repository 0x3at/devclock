/** @format */

import { env, LogOutputChannel } from 'vscode';

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
	syncTimescale: Preference('config.syncTimeScale', EXTENSION_NAME),
};

export const FileBlacklist: Record<string, number> = {
	node_modules: 4,
	untitled: 4,
	'://': 4,
	devclock: 4,
	'.log': 4,
};

export const addToBlacklist = (fileName: string, logger: LogOutputChannel) => {
	FileBlacklist[fileName] = FileBlacklist[fileName]
		? FileBlacklist[fileName] + 1
		: 1;
	logger.trace(`Error occurred during file event\nBlacklisted ${fileName}`);
};
export const isBlacklisted = (
	fileName: string,
	logger: LogOutputChannel
): boolean => {
	Object.entries(FileBlacklist).forEach(([key, value]) => {
		if (fileName.toLowerCase().includes(key)) {
			logger.trace(`${fileName} is blacklisted`);
			FileBlacklist[fileName] = 4;
		}
	});

	if (FileBlacklist[fileName] > 3) {
		return true;
	}
	return false;
};
