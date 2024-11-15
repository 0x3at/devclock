import { AppPreferences } from "../../shared/constants/settings";
import { Events } from "../../shared/types/events";
import { Heartbeat } from "../../shared/types/heartbeat";
import { deepFreeze } from "../../shared/utils/deepfreeze";
import { initializeHeartbeat } from "../heartbeat/init";
import {
	createIdleStateManager,
	IdleStateManager
} from "../session/idleactions";
import { InitializeSession } from "../session/init";
import { DataStore } from "./types";
import { Session } from "../../shared/types/session";
import { commands } from "vscode";
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
			let lastHeartbeat = DataStore.heartbeats![DataStore.heartbeats!.length - 1];
			let updatedLastHeartbeat: Heartbeat = {
				...lastHeartbeat,
				duration: h.timestamp - lastHeartbeat.timestamp
			};
			let updatedHeartbeatList = [
				...DataStore.heartbeats!.slice(0, -1),
				updatedLastHeartbeat,
				h
			];
			const updatedSession: Session = {
				sessionID: DataStore.session!.sessionID,
				startTime: DataStore.session!.startTime,
				endTime: h.timestamp,
				appName: DataStore.session!.appName,
				activeTime: idleStateManager.getState().totalActiveTime,
				idleTime: idleStateManager.getState().totalIdleTime
			};
			DataStore = deepFreeze({
				session: updatedSession,
				state: h.eventType,
				heartbeats: updatedHeartbeatList
			});
			
			//!TODO: REMOVE CONSOLE LOG
			console.log(
				`DataStore Memory Consumption (${DataStore.heartbeats!.length} total heartbeats):`,
				(JSON.stringify(DataStore).length / 1024).toFixed(2) + " KB"
			);
			//!TODO: REMOVE CONSOLE LOG
			//! THIS LOGIC IS BACKWARDS FOR TESTING
			if (DataStore.heartbeats!.length! <= AppPreferences.heartbeatThreshold.get()) {
				console.log("Pushing to database and clearing heartbeats");
				commands.executeCommand("devclock.updateDatabase");
			} else {
				DataStore = deepFreeze({
					session: updatedSession,
					state: h.eventType,
					heartbeats: updatedHeartbeatList
				});
			}
		},
		clearHeartBeats: () => {
			DataStore = deepFreeze({
				...DataStore,
				heartbeats: [DataStore.heartbeats!.at(-1)!],
				state:
					DataStore.heartbeats?.[DataStore.heartbeats.length - 1]
						?.eventType || Events.coding
			});
		},
		getIdleStateManager: () => idleStateManager
	};
};
