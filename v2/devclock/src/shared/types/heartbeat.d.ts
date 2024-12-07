import { Events } from "./events";
export type Heartbeat = {
	timestamp: number;
	endTime?: null;
	duration?: number;
	eventType: Events;
	filePath?: string;
	fileName?: string;
	lineCount?: number;
	changeCount?: number;
	currentLanguage?: string;
};
