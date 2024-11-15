import { spawn } from 'child_process';
import * as path from 'path';

const createDatabaseProcess = async (runner: string, data?: string): Promise<string> => {
    const dbPath = path.resolve(__dirname, 'data', 'devclock.db');
    console.log(dbPath,data);
    const runners = {
        create: 'createdbrunner.mjs',
        move: 'movedbrunner.mjs',
        update: 'updatedbrunner.mjs'
    };

    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, 'runners', runners[runner as keyof typeof runners]);
        
        const process = spawn('node', [scriptPath, dbPath,data ? data : ''], {
            stdio: ['inherit', 'pipe', 'pipe'],
            detached: true,
            windowsHide: true,
        });

        process.stdout.on('data', (data) => {
            console.log('Database process output:', data.toString());
        });

        process.stderr.on('data', (data) => {
            console.error('Database process error:', data.toString());
        });

        process.on('close', (code) => {
            if (code === 0) {
                resolve(dbPath);
            } else {
                reject(new Error(`Process exited with code ${code}`));
            }
        });

        process.on('error', (error) => {
            reject(error);
        });
    });
};

export const createDatabase = async () => {
    try {
        const dbPath = await createDatabaseProcess('create');
        console.log('Database initialization completed');
        return dbPath;
    } catch (error) {
        console.error('Failed to create database:', error);
        throw error;
    }
};

export const updateDatabase = async () => {
    console.log('Updating database...');
    let globals =  await import('../shared/constants/globalconstants.js');
    if (!globals.DATASTORE.getStore().heartbeats!.at(-2)?.duration){
        console.log("No duration found, skipping update -- waiting");
        setTimeout(() => {
            updateDatabase();
        }, 1000);
        return;
    }
    try {
        await createDatabaseProcess('update', JSON.stringify(globals.DATASTORE.getStore()));
        globals.DATASTORE.clearHeartBeats();
    } catch (error) {
        console.error('Failed to update database:', error);
        throw error;
    }
};