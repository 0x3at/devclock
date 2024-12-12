/** @format */

import { EventEmitter } from 'events';
import { throttle } from '../../utils/throttle';
import { EventData, VSCodeEventData } from '../../shared/types/generic.s.t';

type BufferEvent = {
	data: VSCodeEventData<EventData>;
	timestamp: number;
	sequance: number;
};

export interface EventBufferOptions {
	batchSize?: number;
	throttleMs?: number;
}

export const EventBuffer = (options: EventBufferOptions = {}) => {
	const { batchSize = 5, throttleMs = 500 } = options;

	const emitter = new EventEmitter();
	let buffer: BufferEvent[] = [];
	let sequance = 0;

	const emitBatch = () => {
		if (buffer.length === 0) {
			return;
		}

		const batch = [...buffer];
		buffer = [];
		emitter.emit('onDumpBufferBatch', batch);
		sequance = 0;
	};

	const throttledEmit = throttle(emitBatch, throttleMs);

	return {
		push: (event: Omit<BufferEvent, 'timestamp'>) => {
			const bufferedEvent: BufferEvent = {
				...event,
				timestamp: Date.now(),
				sequance,
			};
			sequance++;
			buffer.push(bufferedEvent);

			if (buffer.length >= batchSize) {
				emitBatch();
			} else {
				throttledEmit();
			}
		},
		onDumpBufferBatch: (callback: (events: BufferEvent[]) => void) => {
			emitter.on('onDumpBufferBatch', callback);
		},
	};
};
