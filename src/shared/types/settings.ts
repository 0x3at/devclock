import { Uri, SecretStorage } from "vscode";

export type TypeAppDetails = {
    appName: string;
    appRoot: string;
    startTime: number;
    sessionID: string;
    machineID: string;
    isDesktop: boolean;
};
export type TypeAppPreferences = {
    timerAlignment: Preference;
    showTimer: Preference;
    debug: Preference;
    syncMode: Preference;
    throttleTime: Preference;
    heartbeatThreshold: Preference;
};
export type TypeAppStorage = {
    globalStorage: Promise<Uri>;
    appSecrets: SecretStorage;
};

export type PreferenceFactory = (name:string) =>Preference;

export type Preference={
	get: () => any;
	listener: () => any;
};
