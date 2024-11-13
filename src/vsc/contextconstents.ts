import { Memento, SecretStorage, Uri } from "vscode";
import {CONTEXT} from "../core/globalconstants";

//* App Directory - The only directory that is guaranteed to exist
export const APPDIRECTORY: string = CONTEXT.getContext()!.globalStorageUri.path;

//* [TEMP]In Memory Storage State Maps
export const GLOBALSTATEMAP: Memento = CONTEXT.getContext()!.globalState;
export const WORKSPACESTATEMAP: Memento = CONTEXT.getContext()!.workspaceState;
export const APPSECRETS: SecretStorage = CONTEXT.getContext()!.secrets;

//* App Disk Storage Directories
export const GlobalStorage:string = CONTEXT.getContext()!.globalStorageUri.path;
export const WorkspaceStorage:string|undefined = CONTEXT.getContext()!.storageUri?.path;

//* Debug Logging of Context Constants
console.log('Context Constants Debug Log:', {
    APPDIRECTORY,
    GLOBALSTATEMAP,
    WORKSPACESTATEMAP,
    APPSECRETS,
    GlobalStorage,
    WorkspaceStorage
});
