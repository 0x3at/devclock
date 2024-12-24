import * as vscode from 'vscode';
import { AppPreferences } from '../shared/settings';
import { DashboardProcessManager } from './dashboard.process';

export const DashboardView = async (context: vscode.ExtensionContext) => {
	const panel = vscode.window.createWebviewPanel(
		'devclock.dashboard',
		'Devclock Dashboard',
		vscode.ViewColumn.One,
		{
			enableScripts: true,
			retainContextWhenHidden: true,
		}
	);

	const processManager = DashboardProcessManager(context);

	// Show initial loading state
	panel.webview.html = getWebviewContent(null);

	try {
		// Set up message passing from the process manager
		processManager.onOutput((output: string) => {
			panel.webview.postMessage({ type: 'output', content: output });
		});

		const url = await processManager.initialize();
		panel.webview.html = getWebviewContent(null, url);
	} catch (error: any) {
		panel.webview.html = getWebviewContent(
			`Failed to load dashboard: ${error.message}`
		);
	}

	panel.onDidDispose(() => {
		processManager.cleanup();
	});

	return panel;
};

const getWebviewContent = (message?: string | null, url?: string): string => {
	return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Devclock Dashboard</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: var(--vscode-editor-background);
                    color: var(--vscode-editor-foreground);
                    font-family: var(--vscode-font-family);
                }
                iframe {
                    border: none;
                    width: 100%;
                    height: 100%;
                    display: ${url ? 'block' : 'none'};
                }
                .console-output {
                    display: ${url ? 'none' : 'flex'};
                    flex-direction: column;
                    width: 80%;
                    max-width: 800px;
                    height: 400px;
                    background-color: var(--vscode-terminal-background);
                    color: var(--vscode-terminal-foreground);
                    border-radius: 6px;
                    padding: 16px;
                    font-family: var(--vscode-editor-font-family);
                    font-size: 12px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                }
                .message {
                    padding: 20px;
                    text-align: center;
                }
                .loading-spinner {
                    margin-bottom: 16px;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            ${
				url
					? `
                <iframe src="${url}"></iframe>
            `
					: `
                <div class="console-output" id="console">
                    <div class="loading-spinner">
                        <span>Starting development server...</span>
                    </div>
                </div>
            `
			}
            <script>
                const consoleOutput = document.getElementById('console');
                
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'output') {
                        const line = document.createElement('div');
                        line.textContent = message.content;
                        consoleOutput.appendChild(line);
                        consoleOutput.scrollTop = consoleOutput.scrollHeight;
                    }
                });
            </script>
        </body>
        </html>`;
};
