import { Events } from "../types/events";
import { Heartbeat } from "../types/heartbeat";
export const initializeHeartbeat = (): Heartbeat => {
	return {
		timestamp: Date.now(),
		eventType: Events.initialize
	};
};
