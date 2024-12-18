/** @format */

import { Disposable, ExtensionContext } from 'vscode';

export const ContextStore = (ctx: ExtensionContext) => {
	let _ctx: ExtensionContext = ctx;
	return {
		get: () => _ctx,
		subscribe: (d: Disposable) => _ctx.subscriptions.push(d),
	};
};
