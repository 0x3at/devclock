import * as vscode from 'vscode';
import { DashboardView } from './dashboard/dashboard.panel';
import { DataRunnerConstructor } from './data.runner';
import { Devclock } from './domain/devclock.api';
import { ContextStore } from './shared/ctx.s';
import { AppPreferences } from './shared/settings';
import { Preference } from './utils/generators/preference.g';
export async function activate(context: vscode.ExtensionContext) {
	const ctxStore = ContextStore(context); //* Just in case
	const prefChangeHandlers: vscode.Disposable[] = Object.values(
		AppPreferences
	).map((p: ReturnType<typeof Preference>) => {
		return p.disposable();
	});

	//? Debug Help Command
	const execDebug = vscode.commands.registerCommand(
		'devclock.execDebug',
		async () => {
			vscode.window.showErrorMessage(
				`${
					vscode.Uri.parse(AppPreferences.npmPath.get()).fsPath
				}\n${await AppPreferences.npmPath.set('taco')}\n${
					vscode.Uri.parse(AppPreferences.npmPath.get()).fsPath
				}`,
				{
					modal: true,
				}
			);
		}
	);
	//TODO: Move command registration into API and expose through disposables
	const showDashboard = vscode.commands.registerCommand(
		'devclock.showDashboard',
		async () => {
			const dashboard = await DashboardView(context);
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
	prefChangeHandlers.map((d) => {
		context.subscriptions.push(d);
	});
}

export function deactivate(disposables: vscode.Disposable[]) {
	disposables.forEach((d) => {
		d.dispose();
	});
}
