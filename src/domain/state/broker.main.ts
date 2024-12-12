/** @format */

import {
	EventCallback,
	EventLabel,
	EventPayload,
} from '../../shared/types/generic.s.t';
export const EventBroker = () => {
	const activeListeners = new Map<EventLabel<string>, EventCallback[]>();
	let subscribeTo = (event: EventLabel<string>, listener: EventCallback) => {
		let eventListeners = activeListeners.get(event) || [];
		eventListeners.push(listener);
		activeListeners.set(event, eventListeners);
		return {
			unsubscribe: () => {
				eventListeners = eventListeners.filter((l) => l !== listener);
				activeListeners.set(event, eventListeners);
			},
		};
	};

	let publishEvent = (event: EventLabel<string>, payload: EventPayload) => {
		let eventListeners = activeListeners.get(event) || [];
		eventListeners.forEach((listener) => listener(payload));
	};

	return { subscribeTo, publishEvent };
};
