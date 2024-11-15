import { Events } from "../../shared/types/events";
import { Heartbeat } from "../../shared/types/heartbeat";
export const initializeHeartbeat = (): Heartbeat => {
	return {
		timestamp: Date.now(),
		duration: 0,
		eventType: Events.initialize
	};
};
