import Database from "better-sqlite3";

const dbPath = process.argv[2];

if (!dbPath) {
	console.error("Database path not provided");
	process.exit(1);
}

try {
	console.log("Initializing database...");
	console.log(dbPath);
	const DB = Database(dbPath, { verbose: console.log });

	DB.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            sessionID TEXT PRIMARY KEY,
            startTime INTEGER NOT NULL,
            endTime INTEGER,
            appName TEXT NOT NULL,
            activeTime INTEGER,
            idleTime INTEGER
        );
        
        CREATE TABLE IF NOT EXISTS heartbeats (
            HeartbeatID INTEGER PRIMARY KEY AUTOINCREMENT,
            sessionID TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            eventType TEXT NOT NULL,
            filePath TEXT,
            fileName TEXT,
            lineCount INTEGER,
            changeCount INTEGER,
            currentLanguage TEXT,
            FOREIGN KEY (sessionID) REFERENCES sessions(sessionID)
        );
    `);

	console.log("Database initialized successfully");
	process.exit(0);
} catch (error) {
	console.error("Database initialization failed:", error);
	process.exit(1);
}
