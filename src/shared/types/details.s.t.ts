/** @format */

import { LanguageConfiguration } from 'vscode';

type StatMap<T = FileStats | LanguageStat> = Map<string, T>;
export type Details = {
	files: StatMap<FileStats>;
	langs: StatMap<LanguageStat>;
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
