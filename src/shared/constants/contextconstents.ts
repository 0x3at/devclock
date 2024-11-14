import { Memento, SecretStorage, Uri, workspace as ws } from "vscode";
import { CONTEXT } from "../../infrastructure/vsc/context";

export const ContextConstants = () => {
    const getGlobalDirectory = async (): Promise<Uri> => {
        const uri = CONTEXT.getContext()!.globalStorageUri;
        try {
            console.log("Creating global storage directory:", uri);
            await ws.fs.createDirectory(uri);
            return uri;
        } catch (error) {
            console.error('Failed to create directory:', error);
            throw error;
        }
    };

    const GLOBALSTATEMAP: Memento = CONTEXT.getContext()!.globalState;
    const APPSECRETS: SecretStorage = CONTEXT.getContext()!.secrets;

    return {
        getGlobalDirectory,
        getGlobalStateMap: () => GLOBALSTATEMAP,
        getAppSecrets: () => APPSECRETS
    };
};





// //* Debug Logging of Context Constants
// console.log('Context Constants Debug Log:', {
//     APPDIRECTORY,
//     GLOBALSTATEMAP,
//     WORKSPACESTATEMAP,
//     APPSECRETS,
//     GlobalStorage,
//     WorkspaceStorage
// });
