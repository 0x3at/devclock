/** @format */

import { AppDetails, AppPreferences } from '../../shared/settings';

/** @format */

const TimeBank = () => {
	let _timeBank: Map<string, number> = new Map<string, number>();

	const activeTimerInterface = () => {
		let timer: NodeJS.Timeout | null = null;
		return {
			active: timer ? true : false,
			start: () => {
				let time = _timeBank.get('activeTime') ?? 0;
				timer = setInterval(() => {
					time =
						Date.now() -
						AppDetails.startTime -
						(_timeBank.get('idleTime') ?? 0);
				}, AppPreferences.timeScale.getInt() ?? 1000);
				_timeBank.set('activeTime', time);
				return timer;
			},
			stop: () => {
				if (timer) {
					_timeBank.set(
						'activeTime',
						Date.now() -
							AppDetails.startTime -
							(_timeBank.get('idleTime') ?? 0)
					);
					clearTimeout(timer);
					timer = null;
				} else {
					timer = null;
				}
			},
		};
	};
	const debugTimerInterface = () => {
		let now: number;
		let startTime: number;
		let timer: NodeJS.Timeout | null = null;
		return {
			active: timer ? true : false,
			start: () => {
				now = Date.now();
				startTime = now;
				let time = _timeBank.get('debugTime') ?? 0;
				timer = setInterval(() => {
					time = startTime ? now - startTime : time;
				}, AppPreferences.timeScale.getInt() ?? 1000);
				_timeBank.set('debugTime', time);
				return timer;
			},
			stop: () => {
				if (timer) {
					_timeBank.set(
						'debugTime',
						startTime
							? now - startTime
							: _timeBank.get('debugTime') ?? 0
					);
					clearTimeout(timer);
					timer = null;
				} else {
					timer = null;
				}
			},
		};
	};
	const idleTimerInterface = () => {
		let now: number;
		let startTime: number;
		let timer: NodeJS.Timeout | null = null;
		return {
			active: timer ? true : false,
			start: () => {
				now = Date.now();
				startTime = now;
				let time = _timeBank.get('idleTime') ?? 0;
				timer = setInterval(() => {
					time = startTime ? now - startTime : time;
				}, AppPreferences.timeScale.getInt() ?? 1000);
				_timeBank.set('idleTime', time);
				return timer;
			},
			stop: () => {
				if (timer) {
					_timeBank.set(
						'idleTime',
						startTime
							? now - startTime
							: _timeBank.get('idleTime') ?? 0
					);
					clearTimeout(timer);
					timer = null;
				} else {
					timer = null;
				}
			},
		};
	};
	const activeTimer = activeTimerInterface();
	const debugTimer = debugTimerInterface();
	const idleTimer = idleTimerInterface();

	return {
		initialize: () => {
			if (!_timeBank.get('activeTime')) {
				_timeBank.set('activeTime', 0);
				_timeBank.set('debugTime', 0);
				_timeBank.set('idleTime', 0);
			}
		},
		getBank: () => {
			return _timeBank;
		},
		getSingle: (timerString: 'activeTime' | 'debugTime' | 'idleTime') => {
			return _timeBank.get(timerString);
		},
		startActive: () => {
			activeTimer.start();
		},
		startDebug: () => {
			idleTimer.active ? idleTimer.stop() : '';
			if (debugTimer.active) {
				return;
			} else {
				!activeTimer.active ? activeTimer.start() : '';
				!debugTimer.active ? debugTimer.start() : '';
			}
		},
		startIdle: () => {
			activeTimer.active ? debugTimer.stop() : '';
			debugTimer.active ? debugTimer.stop() : '';
			if (idleTimer.active) {
				return;
			}
			idleTimer.start();
		},
		stopDebug: () => {
			debugTimer.stop();
		},
		stopIdle: () => {
			idleTimer.stop();
		},
	};
};
