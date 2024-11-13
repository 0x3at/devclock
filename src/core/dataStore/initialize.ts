import { DataStore } from "../types/dataStore";
import { Heartbeat } from "../types/heartbeat";
import { deepFreeze } from "../utils/general/deepfreeze";
import { InitializeSession } from "../session/initialize";
import { initializeHeartbeat } from "../heartbeats/initialize";
import { DATASTORE } from "../globalconstants";


type InitializeDataStore = () => {
    getStore: () => Readonly<DataStore>;
    updateStore: (newDataStore: DataStore) => void;
    addHeartbeat: (h:Heartbeat) => void;
    clearHeartBeats: () => void;
}
export const InitializeDataStore:InitializeDataStore = () => {
    let initialDataStore:DataStore = {
        session:InitializeSession(),
        heartbeats: [initializeHeartbeat()]
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