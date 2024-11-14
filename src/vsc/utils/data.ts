import { env } from "vscode";

export const sessionID = (): string => env.sessionId;
export const appName = (): string => env.appName;
export const appHost = (): string => env.appHost;
export const appRoot = (): string => env.appRoot;
export const machineID = (): string => env.machineId;
