import { env } from "vscode";

export const sessionID = ():string => env.sessionId;
export const appName = ():string => env.appName;
export const appHost = ():string => env.appHost;
export const appRoot = ():string => env.appRoot;
export const machineID = ():string => env.machineId;
// export const AppDirectory = ():string => ;
// export const ExtensionGlobalStorage = ():string => ;
// export const ExtensionWorkSpaceStorage = ():string => ;
//Todo: Pull these into the file system as side effects
// const GlobalStorage = fs.existsSync(context!.globalStorageUri.fsPath)
//     ?context!.globalStorageUri.fsPath
//     :path.dirname(context!.globalStorageUri.fsPath);
// const WorkspaceStorage = fs.existsSync(context!.storageUri.fsPath)
//     ?context!.storageUri?.fsPath
//     :path.dirname(context!.storageUri.fsPath);
