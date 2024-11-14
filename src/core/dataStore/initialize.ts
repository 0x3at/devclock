import { DataStore } from "../types/dataStore";
import { Heartbeat } from "../types/heartbeat";
import { deepFreeze } from "../utils/general/deepfreeze";
import { InitializeSession } from "../session/initialize";
import { initializeHeartbeat } from "../heartbeats/initialize";
import { Events } from "../types/events";
import { createIdleStateManager, IdleStateManager } from "./idlestate";

type InitializeDataStore = () => {
	getStore: () => Readonly<DataStore>;
	getState: () => Events;
	updateStore: (newDataStore: DataStore) => void;
	addHeartbeat: (h: Heartbeat) => void;
	clearHeartBeats: () => void;
	getTotalIdleTime: () => number;
	getIdleStateManager: () => IdleStateManager;
};

export const InitializeDataStore: InitializeDataStore = () => {
	let idleStateManager = createIdleStateManager();
	let DataStore: Readonly<DataStore> = deepFreeze({
		session: InitializeSession(),
		heartbeats: [initializeHeartbeat()],
		state: Events.coding
	});

	return {
		getStore: () => DataStore,
		getState: () => DataStore.state,
		updateStore: (newDataStore: DataStore) => {
			DataStore = deepFreeze({ ...newDataStore });
		},
		getTotalIdleTime: () => idleStateManager.updateIdleTime(),
		addHeartbeat: (h: Heartbeat) => {
			if (h.eventType !== Events.idle) {
				idleStateManager.resetIdleTimer();
			}
			DataStore = deepFreeze({
				...DataStore,
				state: h.eventType,
				heartbeats: [...(DataStore.heartbeats || []), h]
			});
		},
		clearHeartBeats: () => {
			DataStore = deepFreeze({
				...DataStore,
				heartbeats: [],
				state:
					DataStore.heartbeats?.[DataStore.heartbeats.length - 1]
						?.eventType || Events.coding
			});
		},
		getIdleStateManager: () => idleStateManager
	};
};

//!Deprecated
// export const InitializeDataStore: InitializeDataStore = () => {
// 	let initialDataStore: DataStore = {
// 		session: InitializeSession(),
// 		heartbeats: [initializeHeartbeat()],
// 		state: Events.coding
// 	};
// 	let DataStore: Readonly<DataStore> = Object.freeze(initialDataStore);
// 	let totalIdleTime: number = 0;
// 	let idleTimer: NodeJS.Timeout = setTimeout(() => {}, 15 * 60 * 1000);

// 	let resetIdleTimer = (timer: NodeJS.Timeout) => {
// 		if (timer) {
// 			clearTimeout(timer);
// 		}
// 		return setTimeout(() => {
// 			idleHeartbeat();
// 		}, 60 * 1000);//15 * 60 * 1000
// 	};

// 	return {
// 		getStore: () => DataStore,
// 		getState: () => DataStore.state,
// 		updateStore: (newDataStore: DataStore) => {
// 			DataStore = deepFreeze({ ...newDataStore });
// 		},
// 		getTotalIdleTime: () => {
// 			if (DataStore.state === Events.idle) {
// 				console.log("Original IdleTime", totalIdleTime);
// 				totalIdleTime =
// 					totalIdleTime +
// 					signedSubtract(
// 						CurrentTime("m"),
// 						DataStore.heartbeats![DataStore.heartbeats!.length - 1]
// 							.timestamp
// 					);
// 				console.log("state", DataStore.state);
// 				console.log("New IdleTime after update", totalIdleTime);
// 				return totalIdleTime;
// 			}
// 			console.log("state", DataStore.state);
// 			console.log("IdleTime unchanged", totalIdleTime);
// 			return totalIdleTime;
// 		},
// 		addHeartbeat: (h: Heartbeat) => {
// 			if (DataStore.state === Events.idle) {
// 				totalIdleTime =
// 					totalIdleTime +
// 					absSubtract(
// 						h.timestamp,
// 						DataStore.heartbeats![DataStore.heartbeats!.length - 1]
// 							.timestamp
// 					);
// 			}
// 			if (h.eventType !== Events.idle) {
// 				resetIdleTimer(idleTimer);
// 			}
// 			DataStore = deepFreeze({
// 				...DataStore,
// 				state: h.eventType,
// 				heartbeats: DataStore.heartbeats
// 					? [...DataStore.heartbeats, h]
// 					: [h]
// 			});
// 			console.log(
// 				"-----------------New Heartbeat Registered---------------"
// 			);
// 			console.log("AppState:", DataStore.state);
// 			console.log("Total Idle Time:", totalIdleTime);
// 			console.log("Heartbeats:", DataStore.heartbeats);
// 		},
// 		clearHeartBeats: () => {
// 			DataStore = deepFreeze({
// 				session: DataStore.session,
// 				heartbeats: [],
// 				state: DataStore.heartbeats![DataStore.heartbeats!.length - 1]
// 					.eventType
// 			});
// 		}
// 	};
// };
