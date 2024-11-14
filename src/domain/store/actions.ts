import { initializeHeartbeat } from "../heartbeat/init";
import { InitializeSession } from "../session/init";
import { DataStore } from "./types";
import { Events } from "../../shared/types/events";
import { Heartbeat } from "../../shared/types/heartbeat";
import { deepFreeze } from "../../shared/utils/deepfreeze";
import { createIdleStateManager, IdleStateManager } from "../session/idleactions";

type InitializeDataStore = () => {
	getStore: () => Readonly<DataStore>;
	getState: () => Events;
	updateStore: (newDataStore: DataStore) => void;
	addHeartbeat: (h: Heartbeat) => void;
	clearHeartBeats: () => void;
	getTotalIdleTime: () => number;
	getIdleStateManager: () => IdleStateManager;
};

//* I want to refactor but this shit works so im not touching it

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
			console.log(`DataStore Memory Consumption (${DataStore.heartbeats?.length} total heartbeats):`,
				(JSON.stringify(DataStore).length / 1024).toFixed(2) + ' KB');
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
