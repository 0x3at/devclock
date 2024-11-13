import { Heartbeat } from "../types/heartbeat";
export const initializeHeartbeat = ():Heartbeat => {
    return {
        timestamp: Date.now(),
        eventType: "initialize",
    };
};