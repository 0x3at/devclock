/** @format */

import {
	commands,
	Disposable,
	ExtensionContext,
	LogOutputChannel,
	window,
} from 'vscode';
import { StatusBarTimerConstructor } from './timer.statusbar';
import { initializeBrokerSubscriptions } from './broker/broker.init';
import { EventBrokerConstructor } from './broker/broker.main';
import { StateManagerConstructor } from './state/state.manager';
import { DataRunnerConstructor } from '../data.runner';

export const Devclock = (
	ctx: ExtensionContext,
	logger: LogOutputChannel,
	dataRunner: ReturnType<typeof DataRunnerConstructor>
) => {
	let broker: ReturnType<typeof EventBrokerConstructor> | null = null;
	let stateManager: ReturnType<typeof StateManagerConstructor> | null = null;
	let statusBarTimer: ReturnType<typeof StatusBarTimerConstructor> | null =
		null;
	let timeTicker: NodeJS.Timeout | null = null;
	let disposables: Disposable[] = [];

	//TODO: Move Tick Logic to its own file?
	//TODO: Test performance between Event Queue & immediate Event Publishing
	const onTick = async () => {
		let now = Date.now();
		logger.debug('Processing events');
		await broker!.processQueue(now);
		logger.debug('Ticking state manager');
		stateManager!.tick(now);
		logger.debug(
			'Ticking status bar timer with state:',
			stateManager!.state()
		);
		statusBarTimer!.tick(
			stateManager!.state(),
			stateManager!.time.getSingle(stateManager!.state())!
		);
	};

	return {
		activate: () => {
			logger.info('Activating Devclock Extension');
			broker = EventBrokerConstructor(logger);
			stateManager = StateManagerConstructor(logger, dataRunner);
			statusBarTimer = StatusBarTimerConstructor();
			stateManager!.initialize(Date.now());
			initializeBrokerSubscriptions(
				stateManager!,
				broker!,
				logger
			).forEach((disposable) => disposables.push(disposable));
			timeTicker = setInterval(() => {
				onTick();
			}, 1000);
			disposables.push(statusBarTimer!.timer);
			const forceSync = commands.registerCommand(
				'devclock.forceSync',
				() => {
					stateManager!.forceSync();
				}
			);
			disposables.push(forceSync);
			logger.info('Devclock Extension Activated');
			return disposables;
		},
	};
};
