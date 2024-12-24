/** @format */

import * as fs from 'fs';
import * as path from 'path';
import { simpleGit } from 'simple-git';
import * as vscode from 'vscode';
import { AppPreferences } from '../shared/settings';

export const DashboardProcessManager = (context: vscode.ExtensionContext) => {
	let devServer: any = null;
	let isServerRunning = false;
	let outputCallback: ((output: string) => void) | null = null;
	const repoUrl = 'https://github.com/0x3at/devclock.git';
	const targetFolder = 'dashboard';

	const getDashboardPath = (): string => {
		return path.join(context.globalStorageUri.fsPath, targetFolder);
	};

	const initGitRepo = async (): Promise<void> => {
		const dashboardPath = getDashboardPath();
		const tempDir = path.join(
			context.globalStorageUri.fsPath,
			'.temp-' + Date.now()
		);

		try {
			const exists = await vscode.workspace.fs
				.stat(vscode.Uri.file(dashboardPath))
				.then(() => true)
				.then(undefined, () => false);

			if (exists) {
				return;
			}

			// Create temp directory for sparse checkout
			fs.mkdirSync(tempDir, { recursive: true });

			const git = simpleGit(tempDir);

			// Clone with sparse checkout setup
			await git.clone(repoUrl, tempDir, [
				'--no-checkout',
				'--depth',
				'1',
			]);
			await git.raw(['sparse-checkout', 'init', '--cone']);
			await git.raw(['sparse-checkout', 'set', targetFolder]);
			await git.checkout('master'); // or 'main' depending on your default branch

			// Move only the dashboard folder to final destination
			const sourcePath = path.join(tempDir, targetFolder);
			fs.mkdirSync(path.dirname(dashboardPath), { recursive: true });
			fs.renameSync(sourcePath, dashboardPath);
			const configFile = fs.readFileSync(
				path.join(
					dashboardPath,
					`/src/app/_config/default.devclock.config.json`
				),
				'utf-8'
			);
			const configJson: {
				default_theme: string;
				data_path: string;
				theme_list: any;
			} = JSON.parse(configFile);
			configJson.data_path = context.globalStorageUri.fsPath;
			fs.writeFileSync(
				path.join(
					dashboardPath,
					`/src/app/_config/devclock.config.json`
				),
				JSON.stringify(configJson),
				'utf-8'
			);
		} catch (error: any) {
			throw new Error(`Git operation failed: ${error.message}`);
		} finally {
			// Cleanup temp directory
			if (fs.existsSync(tempDir)) {
				fs.rmSync(tempDir, { recursive: true, force: true });
			}
		}
	};

	const installDependencies = async (): Promise<void> => {
		try {
			const dashboardPath = getDashboardPath();
			console.log('Starting npm install in:', dashboardPath);
			const npmRun = require('npm-run-script');
			const { exec } = require('child_process');
			const util = require('util');
			const execAsync = util.promisify(exec);

			// Helper function to validate npm command
			const validateNpmCommand = async (
				npmCommand: string
			): Promise<boolean> => {
				try {
					await execAsync(`${npmCommand} --version`);
					return true;
				} catch {
					return false;
				}
			};

			// Helper function to find npm path based on OS
			const findNpmPath = async (): Promise<string> => {
				try {
					const command =
						process.platform === 'win32'
							? 'where npm'
							: 'which npm';
					const { stdout } = await execAsync(command);
					return stdout.trim();
				} catch (error) {
					console.error('Failed to find npm path:', error);
					return '';
				}
			};

			// Try running with 'npm' first
			let npmCommand = 'npm';
			let isValidNpm = await validateNpmCommand(npmCommand);

			if (!isValidNpm) {
				outputCallback!('NPM Not Found in Path, searching system...');
				console.log('NPM Not Found in Path, searching system...');
				// Try with AppPreferences path
				npmCommand = vscode.Uri.parse(
					AppPreferences.npmPath.get()
				).fsPath;
				isValidNpm = await validateNpmCommand(npmCommand);

				if (!isValidNpm) {
					outputCallback!('NPM path not set, searching system...');
					console.log('NPM path not set, searching system...');
					// Try to find npm in system
					const systemNpmPath = await findNpmPath();
					if (
						systemNpmPath &&
						(await validateNpmCommand(systemNpmPath))
					) {
						npmCommand = systemNpmPath;
						// Update AppPreferences with valid path
						await AppPreferences.npmPath.set(systemNpmPath);
						outputCallback!(
							`NPM path found, updating settings...${systemNpmPath}`
						);
						console.log('Updated npm path to:', systemNpmPath);
					} else {
						vscode.window.showErrorMessage(
							'NPM Not Found, install NPM or manually set NPM Path in DevClock settings',
							{ modal: true }
						);

						throw new Error(
							'Could not find a valid npm installation'
						);
					}
				} else {
					console.log('NPM found in path:', npmCommand);
				}
			}

			return new Promise((resolve, reject) => {
				const npmProcess = npmRun(`${npmCommand} install --force`, {
					cwd: dashboardPath,
					stdio: ['pipe', 'pipe', 'pipe'],
					env: {
						...process.env,
						FORCE_COLOR: '1',
						NODE_ENV: 'development',
						PATH: process.env.PATH,
					},
					shell: true,
				});

				npmProcess.stdout.on('data', (data: Buffer) => {
					if (outputCallback) {
						outputCallback(data.toString());
					}
					console.log(data.toString());
				});

				npmProcess.stderr.on('data', (data: Buffer) => {
					if (outputCallback) {
						outputCallback(data.toString());
					}
					console.error(data.toString());
				});

				npmProcess.on('exit', (code: number) => {
					if (code === 0) {
						console.log('npm install completed successfully');
						resolve();
					} else {
						const error = new Error(
							`npm install failed with code ${code}`
						);
						if (outputCallback) {
							outputCallback(error.message);
						}
						console.error(error);
						reject(error);
					}
				});

				npmProcess.on('error', (error: Error) => {
					if (outputCallback) {
						outputCallback(error.message);
					}
					console.error('Failed to start npm install:', error);
					reject(error);
				});
			});
		} catch (error: any) {
			console.error('npm install error:', error);
			throw error;
		}
	};

	const startDevServer = async (): Promise<string> => {
		return new Promise((resolve, reject) => {
			try {
				console.log('Starting dev server...');
				const npmRun = require('npm-run-script');

				devServer = npmRun(`${AppPreferences.npmPath.get()} run dev`, {
					cwd: getDashboardPath(),
					stdio: 'pipe',
				});

				devServer.stdout.on('data', (data: Buffer) => {
					const output = data.toString();
					if (outputCallback) {
						outputCallback(output);
					}
					console.log(output);

					if (output.includes('- Local:')) {
						isServerRunning = true;
						const serverUrl = output.split('- Local: ')[1].trim();
						const url = serverUrl.split(' - ')[0];
						resolve(url);
					}
				});

				// Log all stderr data
				devServer.stderr.on('data', (data: Buffer) => {
					if (outputCallback) {
						outputCallback(data.toString());
					}
					console.error(data.toString());
				});

				devServer.on('error', (error: Error) => {
					if (outputCallback) {
						outputCallback(`${error.message}`);
					}
					console.error('Server error:', error);
					reject(error);
				});

				devServer.on('close', (code: number) => {
					console.log(`Server process exited with code ${code}`);
					isServerRunning = false;
					if (code !== 0 && code !== null) {
						reject(new Error(`Server closed with code ${code}`));
					}
				});
			} catch (error) {
				console.error('Server error:', error);
				reject(error);
			}
		});
	};

	const initialize = async (): Promise<string> => {
		try {
			console.log('Initializing dashboard...');
			await initGitRepo();
			console.log('Git repo initialized');
			await installDependencies();
			console.log('Dependencies installed');
			const serverUrl = await startDevServer();
			console.log('Server started at:', serverUrl);
			return serverUrl;
		} catch (error: any) {
			console.error(
				'Initialization error:',
				error,
				'\n NPM:',
				AppPreferences.npmPath.get()
			);
			throw new Error(
				`Dashboard initialization failed: ${error.message}`
			);
		}
	};

	const cleanup = (): void => {
		if (devServer) {
			devServer.kill();
			isServerRunning = false;
		}
	};

	const onOutput = (callback: (output: string) => void) => {
		outputCallback = callback;
	};

	return {
		initialize,
		cleanup,
		isRunning: () => isServerRunning,
		onOutput,
	};
};
