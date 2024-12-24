/** @format */

import { workspace as ws } from 'vscode';

export const Preference = (name: string, extName: string) => {
	let prefMap = () => ws.getConfiguration(extName);
	let value: string = prefMap().get(name)!;

	const _disposable = ws.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration(`${extName}.${name}`)) {
			value = prefMap().get(name)!;
			console.log(
				`Value of ${name.toString()} changed to ${value!.toString()}`
			);
		}
	});

	return {
		get: (): string => prefMap().get(name)!,
		set: async (newValue: string) => {
			await prefMap().update(`${name}`, `${newValue}`, 1);
			return prefMap().get(name)!;
		},
		getInt: () => parseInt(value),
		disposable: () => _disposable,
	};
};
