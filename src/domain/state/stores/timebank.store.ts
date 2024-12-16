/** @format */

import { LogOutputChannel } from 'vscode';
import { State } from '../../../shared/enums/state.s.e';
import { AppDetails } from '../../../shared/settings';

export const TimebankStore = (logger: LogOutputChannel) => {
	let timeRecords: Map<string, number> = new Map<string, number>();

	const activeTimerInterface = () => {
		return {
			tick: (now: number) => {
				let time = timeRecords.get(State.active) ?? 0;
				time =
					now -
					AppDetails.startTime -
					(timeRecords.get(State.idle) ?? 0);
				return time;
			},
		};
	};
	const debugTimerInterface = () => {
		let startTime: number | null = null;
		let active = false;
		return {
			state: () => State.debug,
			active: () => {
				return active;
			},
			start: (now: number) => {
				if (!active) {
					startTime = startTime ? startTime : now;
					active = true;
				}
			},
			tick: (now: number) => {
				let time = timeRecords.get(State.debug) ?? 0;
				time += now - startTime!;
				startTime = now;
				return time;
			},
			stop: (now: number) => {
				let time = timeRecords.get(State.debug) ?? 0;
				time += now - startTime!;
				startTime = null;
				active = false;
				timeRecords.set(State.debug, time);
			},
		};
	};
	const idleTimerInterface = () => {
		let startTime: number | null = null;
		let active = false;
		return {
			state: () => State.idle,
			active: () => {
				return active;
			},
			start: (now: number) => {
				if (!active) {
					startTime = startTime ? startTime : now;
					active = true;
				}
			},
			tick: (now: number) => {
				if (!startTime) {
					startTime = now;
				}
				let time = timeRecords.get(State.idle) ?? 0;
				time += now - startTime;
				startTime = now;
				return time;
			},
			stop: (now: number) => {
				if (!startTime) {
					startTime = now;
				}
				let time = timeRecords.get(State.idle) ?? 0;
				time += now - startTime;
				startTime = null;
				timeRecords.set(State.idle, time);
			},
		};
	};
	const activeTimer = activeTimerInterface();
	const debugTimer = debugTimerInterface();
	const idleTimer = idleTimerInterface();
	const timers = [debugTimer, idleTimer];

	return {
		initialize: (now: number) => {
			if (!timeRecords.get(State.active)) {
				timeRecords.set(State.active, 0);
				timeRecords.set(State.debug, 0);
				timeRecords.set(State.idle, 0);
			}
			activeTimer.tick(now);
			logger.info('Time Tracker is now active');
		},
		start: (state: State, now: number) => {
			timers.forEach((timer) => {
				if (timer.state() === state) {
					timer.start(now);
				}
			});
		},
		stop: (state: State, now: number) => {
			timers.forEach((timer) => {
				if (timer.state() === state) {
					timer.stop(now);
				}
			});
		},
		tick: (now: number) => {
			timeRecords.set(State.active, activeTimer.tick(now));
			timers.forEach((timer) => {
				if (timer.active()) {
					timeRecords.set(timer.state(), timer.tick(now));
				}
			});
		},
		getBank: () => {
			return {
				activeTime: timeRecords.get(State.active)!,
				debugTime: timeRecords.get(State.debug)!,
				idleTime: timeRecords.get(State.idle)!,
			};
		},
		getSingle: (state: State) => {
			return timeRecords.get(state);
		},
	};
};
