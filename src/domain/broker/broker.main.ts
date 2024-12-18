/** @format */

import { LogOutputChannel } from 'vscode';
import { isBlacklisted } from '../../shared/settings';

//TODO: Test performance on the event queue vs processing events immediately
//?[BUG] The workspace.onDidChangeTextEditor event has reliability issues, but when not registered
//?[BUG] creates the potential for innacurate state when idle
export const EventBrokerConstructor = (logger: LogOutputChannel) => {
	const subs = new Map<string, CallableFunction[]>();
	const tempSubs = new Map<string, CallableFunction[]>();
	let eventQueue: Record<string, any[]> = {};
	const processQueue = async (now: number) => {
		const promises: Promise<void>[] = [];
		const currentQueue = { ...eventQueue };
		eventQueue = {};

		//!REFACTOR Add debug logging to see what's in the queue
		logger.debug(
			`Processing queue with events: ${Object.keys(currentQueue).join(
				', '
			)}`
		);

		Object.entries(currentQueue).forEach(([eventName, events]) => {
			const callbacks = subs.get(eventName);

			//!REFACTOR Add debug logging for callbacks
			logger.debug(
				`Found ${
					callbacks?.length || 0
				} callbacks for event: ${eventName}`
			);

			if (!callbacks?.length) {
				logger.debug(`No callbacks registered for event: ${eventName}`);
				return;
			}

			events.forEach((eventData) => {
				callbacks.forEach((callback) => {
					promises.push(
						Promise.resolve().then(async () => {
							logger.debug(
								'Processing event:',
								eventName,
								'with file:',
								eventData.document?.fileName ||
									eventData.document?.uri?.fsPath ||
									eventData.fileName
							);
							try {
								await callback({ data: eventData, now: now });
							} catch (error) {
								logger.error(
									`Error processing event ${eventName}:`,
									error
								);
							}
						})
					);
				});
			});
		});

		await Promise.all(promises);
	};

	return {
		processQueue: processQueue,
		queueSize: (eventName?: string) => {
			return eventName
				? eventQueue[eventName]?.length
				: Object.entries(eventQueue).length;
		},
		queueEvent: (eventData: any, eventName: string) => {
			//!REFACTOR Improve Event Validation
			let fileName = eventData.document?.fileName || eventData.fileName;
			if (fileName && isBlacklisted(fileName, logger)) {
				logger.trace('Blacklisted event:', eventName);
				return;
			}
			logger.trace('queueing Event:', eventName);
			if (!eventQueue[eventName]) {
				eventQueue[eventName] = [];
			}
			eventQueue[eventName].push(eventData);
		},
		publish: (eventData: any, eventName: string) => {
			let now = Date.now();
			logger.trace('Publishing Event:', eventName);
			subs.get(eventName)
				? subs
						.get(eventName)!
						.forEach((sub) => sub({ data: eventData, now: now }))
				: '';
			let temp = tempSubs.get('eventName');
			if (temp) {
				temp.forEach((sub) => {
					logger.trace('Executing temporary subscription:', sub);
					sub({ data: eventData, now: now });
				});
				tempSubs.delete(eventData);
			}
		},
		subscribe: (
			eventName: string,
			callback: ({ data, now }: { data: any; now: number }) => void
		) => {
			logger.debug(`Subscribing to event: ${eventName}`);
			let _subs = subs.get(eventName) || [];
			if (_subs.length === 0) {
				_subs.push(callback);
				subs.set(eventName, _subs);
				logger.debug(`First subscriber for ${eventName}`);
				return;
			}
			let dup = _subs.includes(callback);
			if (dup) {
				logger.debug(`Duplicate subscriber for ${eventName}`);
				return;
			}
			_subs.push(callback);
			subs.set(eventName, _subs);
			logger.debug(
				`Added subscriber to ${eventName}, total: ${_subs.length}`
			);
		},
		subscribeOnce: (
			eventName: string,
			callback: ({ data, now }: { data: any; now: number }) => void
		) => {},
		unsubscribeAll: (eventName: string) => {},
		subCount: (eventName: string) => {},
		listEvents: (): string[] => {
			let list = Array.from(subs.keys());
			Array.from(tempSubs.keys()).forEach((e) => {
				if (!list.includes(e)) {
					list.push(e);
				}
			});
			return list;
		},
	};
};
