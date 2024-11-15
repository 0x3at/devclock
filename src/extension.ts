import * as vscode from "vscode";
import { CONTEXT } from "./infrastructure/vsc/context";
import { initializeExtension } from "./initialize";
import { asyncAppCommands } from "./presentation/commands/initialize";

export function activate(ctx: vscode.ExtensionContext) {

	CONTEXT.setContext(ctx); //* Set the context to easily share

	const startup = asyncAppCommands(ctx); //TODO: Find a better name for this
	const commandDisposables = startup.getDisposables(); //TODO: Find a way to dynamically get the disposables
	vscode.commands.executeCommand('devclock.setupDatabase');

	commandDisposables.map((d) => ctx.subscriptions.push(d)); //TODO: Find a better way to handle the subscriptions


	if (CONTEXT.getContext() !== null) {
		initializeExtension(ctx); //TODO: Figure out a way for this to handled in the activation event
	}
}
export function deactivate() {}

