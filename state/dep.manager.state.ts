/** @format */
import { Status } from '../../shared/enums/status.s.e';
import { AppDetails, AppPreferences } from '../../shared/settings';
import { Session } from '../../shared/types/session.s.t';

export const DEPRECATED_StateManager = () => {
	let status: Status = Status.active;
	let lastActive: number = Date.now();
	let debugStart: number;
	let lastIdle: number = 0;
	let session: Session = {
		appName: AppDetails.name,
		sessionID: AppDetails.sessionID,
		startTime: AppDetails.startTime,
		duration: 0,
		activeTime: 0,
		debugTime: 0,
		idleTime: 0,
		details: {
			fileStats: new Map(),
			langStats: new Map(),
		},
	};

	let interval: number = parseInt(AppPreferences.timeScale.get());
	let activeTimer = () => {
		let isOn: boolean;
		let timer: NodeJS.Timeout | null = null;
		let _stop = () => {
			if (timer as NodeJS.Timeout) {
				clearInterval(timer!);
			}
		};
		return {
			isOn: timer ? true : false,
			start: () => {
				status = Status.active;
				lastActive = Date.now();
				if (timer) {
					clearInterval(timer);
				}
				timer = setInterval(() => {
					if (
						status !== Status.active ||
						(status as Status) !== Status.debug
					) {
						_stop();
						return;
					}
					lastActive = Date.now();
					let activeTime = Math.max(
						0,
						session.duration - session.idleTime
					);
					session = { ...session, activeTime: activeTime };
				}, interval);
			},
			goIdle: () => {
				_stop();
				let idleT = idleTimer();
				idleT.start();
				return idleT;
			},
		};
	};
	let idleTimer = () => {
		let isOn: boolean;
		let timer: NodeJS.Timeout | null = null;
		let _goActive = () => {
			if (timer) {
				clearInterval(timer!);
			}
			let activeT = activeTimer();
			activeT.start();
			return activeT;
		};
		return {
			isOn: timer ? true : false,
			start: () => {
				status = Status.idle;
				lastIdle = Date.now();
				timer = setInterval(() => {
					if ((status as Status) !== Status.idle) {
						_goActive();
						return;
					}

					let idleTime =
						lastActive > lastIdle
							? session.idleTime + (Date.now() - lastActive)
							: session.idleTime + (Date.now() - lastIdle);
					session = { ...session, idleTime: idleTime };
					lastIdle = Date.now();
				}, interval);
			},
		};
	};
	let debugTimer = () => {
		let isOn: boolean;
		let timer: NodeJS.Timeout | null = null;
		return {
			start: () => {
				status = Status.debug;
				debugStart = Date.now();
				timer = setInterval(() => {
					let debugTime =
						session.debugTime + (Date.now() - debugStart);
					session = {
						...session,
						debugTime: debugTime,
					};
				}, interval);
			},
			end: () => {
				clearInterval(interval);
			},
		};
	};
	return {
		idleWatcher: () => {
			return idleTimer().start;
		},
		getStatus: () => status,
		getSession: () => session,
		checkTimeValues: (status?: Status): number | Partial<Session> => {
			if (status) {
				switch (status) {
					case Status.active:
						return session.activeTime;
					case Status.debug:
						return session.debugTime;
					case Status.idle:
						return session.idleTime;
				}
			} else {
				return {
					duration: session.duration,
					activeTime: session.activeTime,
					debugTime: session.debugTime,
					idleTime: session.idleTime,
				};
			}
		},
		updateSession: (_session: Session) => {
			session = { ...session, ..._session };
		},
	};
};
