/** @format */

import {
	EventLabel,
	EventPayload,
	EventCallback,
} from '../../shared/types/generic.s.t';
import { Disposable } from 'vscode';
export const EventBroker = () => {
	const activeListeners = new Map<EventLabel<string>, EventCallback[]>();
	const activeDisposables = new Map<EventLabel<string>, Disposable>();
	// Register Custom Event (label:eventLable, publisher:publishEvent)
	//Register VSC Event (event:VSCodeEvent, label:eventLabel, publisher:publishEvent) => push to disposable
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
