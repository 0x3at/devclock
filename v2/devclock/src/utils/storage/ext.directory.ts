import { existsSync } from "fs";
import { Uri, workspace as ws } from "vscode";

export const dirExists = (dir: string) => {
	return existsSync(dir);
};

export const makeDir = async (dir: string) => {
	let uri = Uri.file(dir);
	await ws.fs.createDirectory(uri);
	return uri;
};
