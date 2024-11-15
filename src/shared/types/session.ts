export type Session = {
	sessionID: string;
	startTime: number;
	endTime: number | null;
	appName: string;
	activeTime: number;
	idleTime: number;
};
