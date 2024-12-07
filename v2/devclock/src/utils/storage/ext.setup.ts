import { ExtensionContext } from "vscode";
import { dirExists, makeDir } from "./ext.directory";
export const ExtReady = (ctx: ExtensionContext) => {
	let extPath = ctx.globalStorageUri.fsPath;
	if (dirExists(extPath)) {
		return true;
	} else {
		try {
			makeDir(extPath).then((uri)=>{
                console.log("directory made at the following URI", uri.fsPath);
                return true;
            });
		} catch (error) {
			console.log("Error in ExtReady - could not make dir", error);
            return false;
		}
	}
};
