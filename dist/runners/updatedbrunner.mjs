import Database from "better-sqlite3";

const [dbPath, dataString] = process.argv.slice(2);

if (!dbPath || !dataString) {
	console.error("Database path or data not provided");
	process.exit(1);
}

try {
	console.log("Updating database...", dataString);

	const data = JSON.parse(dataString);
	const DB = Database(dbPath, { verbose: console.log });

	// Begin transaction for atomic operation
	const transaction = DB.transaction((data) => {
		// Insert session data
		const insertSession = DB.prepare(`
            INSERT OR REPLACE INTO sessions (
                sessionID,
                startTime,
                endTime,
                appName,
                activeTime,
                idleTime
            ) VALUES (?, ?, ?, ?, ?, ?);
        `);

		// Insert heartbeat data
		const insertHeartbeat = DB.prepare(`
            INSERT INTO heartbeats (
                sessionID,
                timestamp,
                duration,
                eventType,
                filePath,
                fileName,
                lineCount,
                changeCount,
                currentLanguage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
        `);

		// Insert session
		insertSession.run(
			data.session.sessionID,
			data.session.startTime,
			data.heartbeats.at(-1).timestamp,
			data.session.appName,
			data.session.activeTime,
			data.session.idleTime
		);

		// Remove duplicate heartbeats based on timestamp and eventType
		const uniqueHeartbeats = data.heartbeats.filter(
			(heartbeat, index, self) =>
				self.findIndex(
					(h) =>
						h.timestamp === heartbeat.timestamp &&
						h.eventType === heartbeat.eventType &&
						h.filePath === heartbeat.filePath
				) === index
		);
		console.log(
			`trimmed ${
				data.heartbeats.length - uniqueHeartbeats.length
			} heartbeats`
		);
		
		// Insert all heartbeats
		for (const heartbeat of uniqueHeartbeats.slice(0, -1)) {
			insertHeartbeat.run(
				data.session.sessionID,
				heartbeat.timestamp,
				heartbeat.duration,
				heartbeat.eventType,
				heartbeat.filePath,
				heartbeat.fileName,
				heartbeat.lineCount,
				heartbeat.changeCount,
				heartbeat.currentLanguage
			);
		}
	});

	// Execute transaction with data
	transaction(data);

	console.log("Database updated successfully");
	process.exit(0);
} catch (error) {
	console.error("Database update failed:", error);
	process.exit(1);
}
