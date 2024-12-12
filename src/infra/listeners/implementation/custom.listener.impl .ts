/** @format */
import { EventBroker } from '../../../domain/state/broker.main';
import { EventLabel, EventPayload } from '../../../shared/types/generic.s.t';
import { CustomListener } from '../../../shared/types/listener.s.t';

export const createCustomListener = (
	label: EventLabel<string>,
	broker: ReturnType<typeof EventBroker>,
	delay?: {
		fn: (
			arg0: CallableFunction, //throttle or debounce
			arg1: number
		) => (arg0: EventPayload) => void;
		duration: number;
	}
): CustomListener => {
	let _callback = (payload: EventPayload) =>
		broker.publishEvent(label, payload);

	let active = false;
	let callback = active
		? delay
			? delay.fn(_callback, delay.duration)
			: _callback
		: null;

	return {
		emit: (payload: EventPayload) => {
			if (!callback) {
				active = true;
			}
			callback!(payload);
		},
		pause: () => (active = false),
		resume: () => (active = true),
	};
};
