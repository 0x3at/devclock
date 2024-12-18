export type DevClockSession = {
	appName: string;
	sessionID: string;
	startTime: number;
	duration: number;
	activeTime: number;
	debugTime: number;
	idleTime: number;
	details: DevclockSessionDetails;
};
export type DevclockSessionDetails = {
	files: Record<string, FileStatistic>;
	langs: Record<string, LanguageStatistic>;
	metadata: {
		activeFiles: Record<string, ActiveFile>;
		fileBlacklist: Record<string, number>;
	};
};
export type ActiveFile = {
	filePath: string;
	activeTime: number;
};

export type FileStatistic = {
	fileName: string;
	filePath: string;
	isActive: boolean;
	activeFileTime: number;
	startingLineCount: number;
	linesChanged: number;
	language: string;
};

export type LanguageStatistic = {
	language: string;
	activeTime: number;
	totalLines: number;
};
