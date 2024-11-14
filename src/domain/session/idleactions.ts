import { START_TIME } from "../../shared/constants/globalconstants";
import { idleSignal } from "../heartbeat/actions";

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

//* I want to refactor but this shit works so im not touching it

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
		idleSignal();
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
		} else {
			const currentTime = Date.now();
			state = {
				...state,
				totalActiveTime: calculateActiveTime(currentTime)
			};
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
