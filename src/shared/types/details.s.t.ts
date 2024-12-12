/** @format */

import { LanguageConfiguration } from 'vscode';

type StatMap = Map<string, FileStats | LanguageStat>;
export type Details = {
	files: StatMap;
	langs: StatMap;
};

export type LanguageStat = {
	language: string;
	activeTime: number;
	totalLines: number;
};

export type FileStats = {
	fileName: string;
	filePath: string;
	isActive: boolean;
	activeFileTime: number;
	startingLineCount: number;
	linesChanged: number;
	language: string;
};
