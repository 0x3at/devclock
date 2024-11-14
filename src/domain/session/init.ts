import { appName, sessionID } from "../../infrastructure/vsc/utils/data";
import { Session } from "../../shared/types/session";

export const InitializeSession = (): Session => {
	return {
		sessionID: sessionID(),
		startTime: Date.now(),
		endTime: null,
		appName: appName()
	};
};
