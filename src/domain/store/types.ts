import { Events } from "../../shared/types/events";
import { Heartbeat } from "../../shared/types/heartbeat";
import { Session } from "../../shared/types/session";
export type DataStore = {
	session: Session | null;
	heartbeats: Heartbeat[] | null;
	state: Events;
};
