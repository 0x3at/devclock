import { ExtensionContext, LogOutputChannel } from 'vscode';
import { DevClockSession } from './shared/types/session.s.t';
import * as path from 'path';
import * as fs from 'fs';

export const DataRunnerConstructor = (
	ctx: ExtensionContext,
	logger: LogOutputChannel
) => {
	let isInitialized = false;
	const dbPath = path.join(ctx.globalStorageUri.fsPath, 'devclock.json');

	const initialize = () => {
		try {
			// Create directory if it doesn't exist
			const dir = path.dirname(dbPath);
			if (!fs.existsSync(dir)) {
				fs.mkdirSync(dir, { recursive: true });
			}

			// Create file if it doesn't exist
			if (!fs.existsSync(dbPath)) {
				fs.writeFileSync(
					dbPath,
					JSON.stringify({
						sessions: [],
					})
				);
			}

			isInitialized = true;
			return true;
		} catch (err) {
			logger.error(`Failed to initialize storage: ${err}`);
			return false;
		}
	};

	const saveSession = async (session: DevClockSession) => {
		if (!isInitialized) {
			return false;
		}

		try {
			const data = JSON.parse(await fs.promises.readFile(dbPath, 'utf8'));

			// Filter out files with no active time
			const filteredFiles = Object.entries(session.details.files)
				.filter(([_, stats]) => stats.activeFileTime > 0)
				.reduce(
					(acc, [key, value]) => ({
						...acc,
						[key]: value,
					}),
					{}
				);

			// Create the session object with filtered files
			const sessionToSave = {
				...session,
				details: {
					...session.details,
					files: filteredFiles,
				},
			};

			// Update or add session
			const sessionIndex = data.sessions.findIndex(
				(s: DevClockSession) => s.sessionID === session.sessionID
			);

			if (sessionIndex >= 0) {
				data.sessions[sessionIndex] = sessionToSave;
			} else {
				data.sessions.push(sessionToSave);
			}

			await fs.promises.writeFile(dbPath, JSON.stringify(data, null, 2));
			logger.info(`Saved session: ${session.sessionID}`);
			return true;
		} catch (err) {
			logger.error(`Failed to save session: ${err}`);
			return false;
		}
	};

	initialize();

	return {
		isInitialized,
		saveSession,
	};
};
