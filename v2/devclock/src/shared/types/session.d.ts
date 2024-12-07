export type Session = {
	appName: string;
	sessionID: string;
	startTime: number;
	endTime: number | null;
	activeTime: number;
	idleTime: number;
};
