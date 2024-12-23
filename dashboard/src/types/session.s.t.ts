export interface SessionFile {
	fileName: string;
	filePath: string;
	isActive: boolean;
	activeFileTime: number;
	startingLineCount: number;
	linesChanged: number;
	language: string;
}

export interface LanguageStats {
	language: string;
	activeTime: number;
	totalLines: number;
}

export interface ActiveFile {
	filePath: string;
	activeTime: number;
}

export interface SessionDetails {
	files: { [key: string]: SessionFile };
	langs: { [key: string]: LanguageStats };
	metadata: {
		activeFiles: { [key: string]: ActiveFile };
		fileBlacklist: Record<string, unknown>;
	};
}

export interface DevclockSession {
	appName: string;
	sessionID: string;
	startTime: number;
	duration: number;
	activeTime: number;
	debugTime: number;
	idleTime: number;
	details: SessionDetails;
}

export interface SessionsData {
	sessions: DevclockSession[];
}
