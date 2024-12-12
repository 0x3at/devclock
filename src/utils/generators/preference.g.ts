import { workspace as ws } from "vscode";

export const Preference = (name:string, extName:string) => {
    let prefMap = ws.getConfiguration(extName);
	let value:string = prefMap.get(name)!;

	let _disposable = ws.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration(name)) {
			value = prefMap.get(name)!;
			console.log(`Value of ${name.toString()} changed to ${value!.toString()}`);
		}
	});

	return {
		get: () => value,
		disposable: () => _disposable
	};
};