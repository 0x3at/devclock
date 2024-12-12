/** @format */

import { EventEmitter } from 'events';
import { QueuedEvent } from '../shared/types/queue.e.s.t';

export const EventQueue = <T>(T: any) => {
	let onBufferReady = new EventEmitter();
	let buffer: any[] = [];
	let lastEvent: any | null = null;

	return {
		enqueue: (event: T) => {
			if (buffer.length === 0) {
				onBufferReady.emit('bufferReady');
			}
			buffer.push({
				data: event,
				timestamp: Date.now(),
				sequence: buffer.length,
			});
			buffer = buffer.sort((a, b) =>
				a.timestamp === b.timestamp
					? a.sequence - b.sequence
					: a.timestamp - b.timestamp
			);
		},
		dequeue: (): QueuedEvent<T> | undefined => {
			return buffer.shift();
		},
		peek: (): QueuedEvent<T> | undefined => {
			return buffer[0];
		},
		isEmpty: (): boolean => {
			return buffer.length === 0;
		},
		size: (): number => {
			return buffer.length;
		},
		fetchAll: (): QueuedEvent<T>[] => {
			return buffer;
		},
		clear: () => {
			buffer = [];
		},
	};
};
