/** @format */

import * as vscode from 'vscode';
/** @format */

export const DashboardView = (context: vscode.ExtensionContext) => {
	const panel = vscode.window.createWebviewPanel(
		'devclock.dashboard',
		'Devclock Dashboard',
		vscode.ViewColumn.One,
		{
			enableScripts: true,
		}
	);

	let url = 'http://localhost:3000';
	panel.webview.html = `
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
	}
	iframe {
		border: none;
		width: 100%;
		height: 100%;
	}
	</style>
    </head>
    <body>
	<iframe src="${url}"></iframe>
    </body>
    </html>`;

	return panel;
};
