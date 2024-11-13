import { Session } from "./session";
import { Heartbeat } from "./heartbeat";

export type DataStore = {
    session: Session | null;
    heartbeats: Heartbeat[]| null;
}