'use server';

import { SessionsData } from '@/types/session.s.t';
import { normalizedSessions } from '../data/fetch.session';

export async function getSessionsData(
	min: number,
	max: number
): Promise<SessionsData> {
	const sessions = await normalizedSessions(min, max);
	return sessions;
}

export async function getTotalTime(min: number, max: number): Promise<number> {
	const sessions = await normalizedSessions(min, max);
	return sessions.sessions.reduce(
		(sum, session) => sum + session.duration,
		0
	);
}

export async function getTotalActiveTime(
	min: number,
	max: number
): Promise<number> {
	const sessions = await normalizedSessions(min, max);
	return sessions.sessions.reduce(
		(sum, session) => sum + session.activeTime,
		0
	);
}
export async function getTotalDebugTime(
	min: number,
	max: number
): Promise<number> {
	const sessions = await normalizedSessions(min, max);
	return sessions.sessions.reduce(
		(sum, session) => sum + session.debugTime,
		0
	);
}

export async function getTotalIdleTime(
	min: number,
	max: number
): Promise<number> {
	const sessions = await normalizedSessions(min, max);
	return sessions.sessions.reduce(
		(sum, session) => sum + session.idleTime,
		0
	);
}

export async function getTopLanguage(
	min: number,
	max: number
): Promise<{ label: string; totalTime: number; totalLines: number }> {
	const sessions = await normalizedSessions(min, max);
	const languages = new Map<string, { time: number; lines: number }>();

	sessions.sessions.forEach((session) => {
		Object.entries(session.details.langs).forEach(([lang, stat]) => {
			if (languages.has(lang)) {
				const current = languages.get(lang)!;
				languages.set(lang, {
					time: current.time + stat.activeTime,
					lines: current.lines + stat.totalLines,
				});
			} else {
				languages.set(lang, {
					time: stat.activeTime,
					lines: stat.totalLines,
				});
			}
		});
	});

	// Find the language with the highest total time
	let topLanguage = '';
	let maxTime = 0;
	let totalLines = 0;

	languages.forEach((stats, lang) => {
		if (stats.time > maxTime) {
			maxTime = stats.time;
			topLanguage = lang;
			totalLines = stats.lines;
		}
	});

	return {
		label: topLanguage,
		totalTime: maxTime,
		totalLines: totalLines,
	};
}

export async function getLanguagesProductivity(
	min: number,
	max: number
): Promise<{ languages: Array<{ language: string; productivity: number; totalLines: number; activeTime: number }>; totalLines: number }> {
	const sessions = await normalizedSessions(min, max);
	const languages = new Map<string, { activeTime: number; totalLines: number }>();

	sessions.sessions.forEach((session) => {
		Object.entries(session.details.langs).forEach(([lang, stat]) => {
			if (languages.has(lang)) {
				const current = languages.get(lang)!;
				languages.set(lang, {
					activeTime: current.activeTime + stat.activeTime,
					totalLines: current.totalLines + stat.totalLines,
				});
			} else {
				languages.set(lang, {
					activeTime: stat.activeTime,
					totalLines: stat.totalLines,
				});
			}
		});
	});

	let totalLines = 0;
	const languagesProductivity = Array.from(languages.entries()).map(([language, stats]) => {
		const productivity = stats.activeTime > 0 ? stats.totalLines / (stats.activeTime / 60000) : 0; // Convert ms to minutes
		totalLines += stats.totalLines;
		return {
			language,
			productivity,
			totalLines: stats.totalLines,
			activeTime: stats.activeTime,
		};
	}).sort((a, b) => b.productivity - a.productivity);

	return {
		languages: languagesProductivity,
		totalLines,
	};
}
