'use server';
import { DevclockSession, SessionsData } from '@/types/session.s.t';
import { getDataPath } from './fetch.config';
import * as fs from 'fs/promises';
import path from 'path';
async function fetchSessions(): Promise<SessionsData> {
	const dataPath = await getDataPath();
	console.log('fetching sessions from', dataPath);
	const sessions = await fs.readFile(
		`${path.join(dataPath, 'devclock.json')}`,
		'utf-8'
	);
	return JSON.parse(sessions);
}

export async function normalizedSessions(
	min: number,
	max: number
): Promise<SessionsData> {
	const sessions = await fetchSessions();
	const dailyData = new Map<string, DevclockSession[]>();

	const startDate = new Date(min);
	const endDate = new Date(max);
	startDate.setHours(0, 0, 0, 0);
	endDate.setHours(23, 59, 59, 999);

	// Initialize each day with empty session arrays
	for (
		let d = new Date(startDate);
		d <= endDate;
		d.setDate(d.getDate() + 1)
	) {
		dailyData.set(d.toISOString().split('T')[0], []);
	}

	// Sort sessions into days
	sessions.sessions.forEach((session) => {
		const sessionDate = new Date(session.startTime);
		const dayKey = sessionDate.toISOString().split('T')[0];

		if (sessionDate >= startDate && sessionDate <= endDate) {
			const dayData = dailyData.get(dayKey)!;
			dayData.push(session);
		}
	});

	// Convert to SessionsData format
	return {
		sessions: Array.from(dailyData.values())
			.map((daySessions) => ({
				appName: daySessions[0]?.appName || '',
				sessionID: new Date(daySessions[0]?.startTime || 0)
					.toISOString()
					.split('T')[0],
				startTime: new Date(daySessions[0]?.startTime || 0).setHours(
					0,
					0,
					0,
					0
				),
				duration: daySessions.reduce((sum, s) => sum + s.duration, 0),
				activeTime: daySessions.reduce(
					(sum, s) => sum + s.activeTime,
					0
				),
				debugTime: daySessions.reduce((sum, s) => sum + s.debugTime, 0),
				idleTime: daySessions.reduce((sum, s) => sum + s.idleTime, 0),
				details: {
					files: daySessions.reduce(
						(acc, s) => ({ ...acc, ...s.details.files }),
						{}
					),
					langs: daySessions.reduce(
						(acc, s) => ({ ...acc, ...s.details.langs }),
						{}
					),
					metadata: {
						activeFiles: daySessions.reduce(
							(acc, s) => ({
								...acc,
								...s.details.metadata.activeFiles,
							}),
							{}
						),
						fileBlacklist: daySessions.reduce(
							(acc, s) => ({
								...acc,
								...s.details.metadata.fileBlacklist,
							}),
							{}
						),
					},
				},
			}))
			.sort((a, b) => a.startTime - b.startTime),
	};
}
