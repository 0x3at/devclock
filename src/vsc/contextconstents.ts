import { Memento, SecretStorage, Uri } from "vscode";
import {CONTEXT} from "../core/globalconstants";

//* App Directory - The only directory that is guaranteed to exist
export const APPDIRECTORY: Uri = CONTEXT.getContext()!.globalStorageUri;

//* [TEMP]In Memory Storage State Maps
export const GLOBALSTATEMAP: Memento = CONTEXT.getContext()!.globalState;
export const WORKSPACESTATEMAP: Memento = CONTEXT.getContext()!.workspaceState;
export const APPSECRETS: SecretStorage = CONTEXT.getContext()!.secrets;

//* App Disk Storage Directories
export const GlobalStorage:Uri|undefined = CONTEXT.getContext()!.globalStorageUri;
export const WorkspaceStorage:Uri|undefined = CONTEXT.getContext()!.storageUri;