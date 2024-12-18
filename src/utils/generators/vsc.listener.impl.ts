/** @format */
import {
	EventLabel,
	VSCodeEvent,
	VSCodeEventPayload,
} from '../../shared/types/generic.s.t';
import { Disposable } from 'vscode';

export const createVSCListener = (
	event: VSCodeEvent<VSCodeEventPayload>,
	label: EventLabel<string>,
	publisher: (data: VSCodeEventPayload, label: EventLabel<string>) => void,
	opts?: {
		fn: (
			callback: (
				arg: VSCodeEventPayload,
				label: EventLabel<string>
			) => void,
			duration: number
		) => (arg: VSCodeEventPayload, label: EventLabel<string>) => void;
		duration: number;
	}
) => {
	let callback = (payload: VSCodeEventPayload) => publisher(payload, label);

	if (opts?.fn) {
		const wrappedCallback = opts.fn(
			(arg, label) => publisher(arg, label),
			opts.duration
		);
		callback = (payload: VSCodeEventPayload) =>
			wrappedCallback(payload, label);
	}

	let disposable: Disposable = event(callback);
	return { disposable };
};
