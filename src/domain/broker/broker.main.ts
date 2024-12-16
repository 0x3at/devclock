/** @format */

import { ExtensionContext, LogOutputChannel } from 'vscode';

export const EventBrokerConstructor = (logger: LogOutputChannel) => {
	const subs = new Map<string, CallableFunction[]>();
	const tempSubs = new Map<string, CallableFunction[]>();
	let eventQueue: Record<string, any[]> = {};
	const processQueue = async (now: number) => {
		const promises: Promise<void>[] = [];
		Object.entries(eventQueue).forEach(([eventName, events]) => {
			const now = Date.now();
			const callbacks = subs.get(eventName);
			const _callbacks = tempSubs.get(eventName);
			if (!callbacks) {
				return;
			}

			events.forEach((eventData) => {
				callbacks.forEach((callback) => {
					promises.push(
						Promise.resolve().then(async () => {
							try {
								logger.debug(
									'Processing event:',
									eventName,
									'with file:',
									eventData.document.fileName
								);
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
				if (_callbacks) {
					_callbacks.forEach((_callback) => {
						promises.push(
							Promise.resolve().then(async () => {
								try {
									logger.debug(
										'Processing event:',
										eventName
									);

									await _callback({
										data: eventData,
										date: now,
									});
								} catch (error) {
									logger.error(
										`Error processing event ${eventName}:`,
										error
									);
								}
							})
						);
					});
				}
			});
		});

		await Promise.all(promises);
		eventQueue = {};
	};

	return {
		processQueue: processQueue,
		queueSize: (eventName?: string) => {
			return eventName
				? eventQueue[eventName]?.length
				: Object.entries(eventQueue).length;
		},
		queueEvent: (eventData: any, eventName: string) => {
			logger.debug('queueing Event:', eventName);
			if (!eventQueue[eventName]) {
				eventQueue[eventName] = [];
			}
			eventQueue[eventName].push(eventData);
		},
		publish: (eventData: any, eventName: string) => {
			let now = Date.now();
			logger.debug('Publishing Event:', eventName);
			subs.get(eventName)
				? subs
						.get(eventName)!
						.forEach((sub) => sub({ data: eventData, now: now }))
				: '';
			let temp = tempSubs.get('eventName');
			if (temp) {
				temp.forEach((sub) => {
					logger.debug('Executing temporary subscription:', sub);
					sub({ data: eventData, now: now });
				});
				tempSubs.delete(eventData);
			}
		},
		subscribe: (
			eventName: string,
			callback: ({ data, now }: { data: any; now: number }) => void
		) => {
			let _subs = subs.get(eventName) || [];
			if (_subs.length === 0) {
				_subs.push(callback);
				subs.set(eventName, _subs);
				return;
			}
			let dup = _subs.includes(callback);
			if (dup) {
				return;
			}
			_subs.push(callback);
			subs.set(eventName, _subs);
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
