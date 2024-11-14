import { idleHeartbeat } from "../heartbeats/callbacks";

type IdleState = {
	isIdle: boolean;
	lastActiveTime: number;
	totalIdleTime: number;
	totalActiveTime: number;
};

export type IdleStateManager = {
	readonly getState: () => IdleState;
	readonly startIdleTimer: () => void;
	readonly resetIdleTimer: () => void;
	readonly updateIdleTime: () => number;
};

import { START_TIME } from "../globalconstants";

export const createIdleStateManager = (
	idleThreshold: number = 60 * 1000
): IdleStateManager => {
	const initialState: IdleState = {
		isIdle: false,
		lastActiveTime: Date.now(),
		totalIdleTime: 0,
		totalActiveTime: 0
	};

	let state = initialState;
	let idleTimer: NodeJS.Timeout;

	const calculateActiveTime = (currentTime: number): number =>
		currentTime - START_TIME - state.totalIdleTime;

	const setIdle = () => {
		const currentTime = Date.now();
		state = {
			...state,
			isIdle: true,
			lastActiveTime: currentTime,
			totalActiveTime: calculateActiveTime(currentTime)
		};
		console.log("Setting Idle State");
		idleHeartbeat();
	};

	const updateIdleTime = (): number => {
		if (state.isIdle) {
			const currentTime = Date.now();
			const newIdleTime = currentTime - state.lastActiveTime;

			state = {
				...state,
				totalIdleTime: state.totalIdleTime + newIdleTime,
				lastActiveTime: currentTime
			};
			console.log("Total Idle Time:", state.totalIdleTime);
		} else {
			const currentTime = Date.now();
			state = {
				...state,
				totalActiveTime: calculateActiveTime(currentTime)
			};
			console.log("Total Active Time:", state.totalActiveTime);
		}
		return state.totalIdleTime;
	};

	return {
		getState: () => ({ ...state }),
		startIdleTimer: () => {
			clearTimeout(idleTimer);
			idleTimer = setTimeout(setIdle, idleThreshold);
		},
		resetIdleTimer: () => {
			const currentTime = Date.now();
			clearTimeout(idleTimer);
			state = {
				...state,
				isIdle: false,
				lastActiveTime: currentTime,
				totalActiveTime: calculateActiveTime(currentTime)
			};
			idleTimer = setTimeout(setIdle, idleThreshold);
		},
		updateIdleTime
	};
};
// export const createIdleStateManager = (
// 	idleThreshold: number = 60 * 1000 //15 * 60 * 1000 - testing with 1 minute
// ): IdleStateManager => {
// 	let state: IdleState = {
// 		isIdle: false,
// 		lastActiveTime: Date.now(),
// 		totalIdleTime: 0
// 	};

// 	let idleTimer: NodeJS.Timeout;

// 	const setIdle = () => {
// 		state = {
// 			...state,
// 			isIdle: true
// 		};
// 		console.log("Setting Idle State");
// 		idleHeartbeat();
// 	};

// 	const updateIdleTime = (): number => {
// 		if (state.isIdle) {
// 			console.log("Idle Time Before Update", state.totalIdleTime);
// 			const currentTime = Date.now();
// 			const newIdleTime = currentTime - state.lastActiveTime;
// 			state = {
// 				...state,
// 				totalIdleTime: state.totalIdleTime + newIdleTime,
// 				lastActiveTime: currentTime
// 			};
// 			console.log("Updating Idle Time", state.totalIdleTime);
// 		}
// 		return state.totalIdleTime;
// 	};

// 	return {
// 		getState: () => ({ ...state }),
// 		startIdleTimer: () => {
// 			clearTimeout(idleTimer);
// 			idleTimer = setTimeout(setIdle, idleThreshold);
// 		},
// 		resetIdleTimer: () => {
// 			clearTimeout(idleTimer);
// 			state = {
// 				...state,
// 				isIdle: false,
// 				lastActiveTime: Date.now()
// 			};
// 			idleTimer = setTimeout(setIdle, idleThreshold);
// 		},
// 		updateIdleTime
// 	};
// };
