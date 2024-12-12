/** @format */

import { State } from '../../shared/enums/state.s.e';

export const createIdleManager = (timeout: number, onIdle: () => void) => {
	let timer: NodeJS.Timeout | null = null;

	const clearIdleTimer = () => {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
	};

	const startIdleTimer = () => {
		clearIdleTimer();
		timer = setTimeout(() => {
			console.log('[IdleManager] Idle timeout triggered');
			onIdle();
		}, 30 * 1000); //Debugging Purposes
		console.log('[IdleManager] Timer started');
	};

	return {
		start: () => {
			console.log('[IdleManager] Starting manager');
			startIdleTimer();
		},
		reset: () => {
			console.log('[IdleManager] Resetting timer');
			startIdleTimer();
		},
		stop: () => {
			console.log('[IdleManager] Stopping manager');
			clearIdleTimer();
		},
		isRunning: () => {
			const running = timer !== null;
			console.log('[IdleManager] Checking if running:', running);
			return running;
		},
	};
};
