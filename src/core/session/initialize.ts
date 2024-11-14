import { appName, sessionID } from "../../vsc/utils/data";
import { Session } from "../types/session";

export const InitializeSession = (): Session => {
	return {
		sessionID: sessionID(),
		startTime: Date.now(),
		endTime: null,
		appName: appName()
	};
};
