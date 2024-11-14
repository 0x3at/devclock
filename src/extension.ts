import * as vscode from "vscode";
import { initializeExtension } from "./initialize";
import { CONTEXT } from "./infrastructure/vsc/context";

export function activate(ctx: vscode.ExtensionContext) {
	//* Set Context
	CONTEXT.setContext(ctx);

	const helloWorld = vscode.commands.registerCommand(
		"devclock.helloWorld",
		() => {
			vscode.window.showInformationMessage("Hello World from DevClock!");
		}
	);

	ctx.subscriptions.push(helloWorld);

	//* Capture Context Reliant Constants
	if (CONTEXT.getContext() !== null) {
		initializeExtension(ctx);
	}
}

export function deactivate() {}
