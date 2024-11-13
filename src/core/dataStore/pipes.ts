import {pipeTwo} from "../utils/general/pipe";
import { textDocumentChanged } from "../heartbeats/callbacks";
import { DATASTORE } from "../globalconstants";
import { throttle } from '../utils/general/throttle';

// export const saveTextChangeHeartbeat = throttle(pipeTwo(textDocumentChanged, DATASTORE.addHeartbeat), 30000);
export const saveTextChangeHeartbeat = pipeTwo(textDocumentChanged, DATASTORE.addHeartbeat);