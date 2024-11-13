import { DataStore } from './types/dataStore';
import { Session } from "./types/session";
import { Heartbeat } from './types/heartbeat';
import { deepFreeze } from './utils/general/deepfreeze';
import {sessionID, appName} from "../vsc/utils/data";

const InitializeSession = ():Session => {
    return {
        sessionID: sessionID(),
        startTime: Date.now(),
        endTime: null,
        appName: appName(),
    };
};


export const InitializeDataStore = () => {
    let initialDataStore:DataStore = {
        session:InitializeSession(),
        heartbeats: []
    };
    let DataStore:Readonly<DataStore> = Object.freeze(initialDataStore);

    return{
        getStore: () => DataStore,
        updateStore: (newDataStore: DataStore) =>{
            DataStore = deepFreeze({...newDataStore});
        },
        addHeartbeat: (h:Heartbeat) =>{
            DataStore = deepFreeze({
                ...DataStore,
                heartbeats: DataStore.heartbeats ? [...DataStore.heartbeats, h] : [h]
            });
        },
        clearHeartBeats: () =>{
            DataStore = deepFreeze({session:DataStore.session,heartbeats:[]});
        }
    };
};

