import { Session } from "../types/session";
import {sessionID, appName} from "../../vsc/utils/data";

export const InitializeSession = ():Session => {
    return {
        sessionID: sessionID(),
        startTime: Date.now(),
        endTime: null,
        appName: appName(),
    };
};