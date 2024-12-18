/** @format */

import * as vscode from 'vscode';
import { ContextStore } from './shared/ctx.s';
import { Devclock } from './domain/devclock.api';
import { DashboardView } from './dashboard/dashboard.panel';
import { DataRunnerConstructor } from './data.runner';
export async function activate(context: vscode.ExtensionContext) {
	const ctxStore = ContextStore(context); //* Just in case

	//? Debug Help Command
	const execDebug = vscode.commands.registerCommand(
		'devclock.execDebug',
		() => {
			vscode.window.showErrorMessage(
				`Why is esbuild not recompiling on debug`,
				{
					modal: true,
				}
			);
		}
	);
	//TODO: Move command registration into API and expose through disposables
	const showDashboard = vscode.commands.registerCommand(
		'devclock.showDashboard',
		() => {
			const dashboard = DashboardView(context);
			dashboard.reveal();
		}
	);
	const deactivateDevclock = vscode.commands.registerCommand(
		'devclock.deactivate',
		() => {
			deactivate(context.subscriptions);
		}
	);
	const activateLogger = vscode.commands.registerCommand(
		'devclock.activateLogger',
		() => {
			logger.show();
		}
	);
	const deactivateLogger = vscode.commands.registerCommand(
		'devclock.deactivateLogger',
		() => {
			logger.dispose();
		}
	);

	//TODO: Add Extension Flags and launch validation preActivation
	const logger = vscode.window.createOutputChannel('Devclock', { log: true });
	const dataRunner = DataRunnerConstructor(ctxStore.get(), logger);

	const devclock = Devclock(ctxStore.get(), logger, dataRunner);
	const devclockDisposables = devclock.activate();
	devclockDisposables.forEach((d) => {
		context.subscriptions.push(d);
	});
	context.subscriptions.push(execDebug);
	context.subscriptions.push(showDashboard);
	context.subscriptions.push(deactivateDevclock);
}

export function deactivate(disposables: vscode.Disposable[]) {
	disposables.forEach((d) => {
		d.dispose();
	});
}
