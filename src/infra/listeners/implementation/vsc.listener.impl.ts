/** @format */
import { VSCListener } from '../../../shared/types/listener.s.t';
import { EventBroker } from '../../../domain/state/broker.main';
import {
	VSCodeEvent,
	VSCodeEventPayload,
} from '../../../shared/types/generic.s.t';

export const createVSCListener = (
	event: VSCodeEvent<VSCodeEventPayload>,
	label: string,
	broker: ReturnType<typeof EventBroker>,
	delay?: {
		fn: (
			arg0: CallableFunction,
			arg1: number
		) => (arg: VSCodeEventPayload) => void;
		duration: number;
	}
): VSCListener => {
	let callback = (arg: VSCodeEventPayload) => broker.publishEvent(label, arg);
	if (delay) {
		callback = delay.fn(callback, delay.duration);
	}

	let disposable = event(callback);

	return {
		pause: () => disposable.dispose(),
		resume: () => {
			disposable = event(callback);
		},
		disposable,
	};
};
