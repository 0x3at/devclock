import * as vscode from "vscode";
import { CONTEXT } from "./core/globalconstants";
import { initializeExtension } from "./initialize";

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
		import("./vsc/contextconstents.js").then(() => {
			initializeExtension();
		});
	}
}

export function deactivate() {}
