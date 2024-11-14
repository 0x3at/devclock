import { Events } from "./events";
import { Heartbeat } from "./heartbeat";
import { Session } from "./session";
export type DataStore = {
	session: Session | null;
	heartbeats: Heartbeat[] | null;
	state: Events;
};
