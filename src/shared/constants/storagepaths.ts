import { Memento, SecretStorage, Uri, workspace as ws } from "vscode";
import { CONTEXT } from "../../infrastructure/vsc/context";

// Cache for resolved global directory
let resolvedGlobalDirectory: Uri | null = null;

export const localStoragePaths = () => {
const getGlobalDirectory = async (): Promise<Uri> => {
		// Return cached value if available
		if (resolvedGlobalDirectory) {
			return resolvedGlobalDirectory;
		}

		const GLOBALSTATEMAP: Memento = CONTEXT.getContext()!.globalState;

		// Check if path is stored in global state
		const storedUri = await GLOBALSTATEMAP.get("globalStorage");
		if (storedUri !== null && storedUri !== undefined) {
			resolvedGlobalDirectory = storedUri as Uri;
			return resolvedGlobalDirectory;
		}

		// Create new directory and cache it
		const uri = CONTEXT.getContext()!.globalStorageUri;
		try {
			await ws.fs.createDirectory(uri);
			await GLOBALSTATEMAP.update("globalStorage", uri);
			resolvedGlobalDirectory = uri;
			return uri;
		} catch (error) {
			console.error("Failed to create directory:", error);
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


